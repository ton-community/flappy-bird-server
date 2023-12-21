import {deployConfig} from '../workspaces/server/src/deploy-config';
import {Address, fromNano, TonClient4} from "@ton/ton";
import {internal, SendMode, toNano} from "@ton/core";
import {wait} from "./utils/wait";
import {
  createClient,
  createWallet,
  getAccountBalance,
  getAccountState,
  openWallet,
  toFriendlyAddress,
  Wallet,
  WalletContract
} from "./utils/sdk";

const MIN_TOP_UP_TON = toNano(1);
const MIN_DEPLOY_BALANCE = toNano(0.5);

/**
 * Wait for wallet state to be top up
 * @param client — TonClient4 instance
 * @param walletAddress — wallet address
 */
async function waitForWalletTopUp(client: TonClient4, walletAddress: Address): Promise<void> {
  while (true) {
    try {
      const balance = await getAccountBalance(client, walletAddress);
      if (balance >= MIN_TOP_UP_TON) {
        return;
      }
    } catch (e) {
    }

    await wait(10_000);

    console.log(`Waiting for top up at least ${fromNano(MIN_TOP_UP_TON)} TON...`);
  }
}

/**
 * Wait for wallet state to be deployed
 * @param client — TonClient4 instance
 * @param wallet — wallet instance
 * @param walletContract — wallet contract instance
 */
async function waitForWalletDeployment(client: TonClient4, wallet: Wallet, walletContract: WalletContract): Promise<void> {
  for (let tryCount = 3; tryCount > 0; tryCount--) {
    try {
      await walletContract.sendTransferAndWait({
        sendMode: SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS,
        secretKey: wallet.keyPair.secretKey,
        messages: [
          internal({
            to: walletContract.address,
            value: toNano(0),
          })
        ]
      });
    } catch (e) {
    }

    await wait(15_000);

    const walletState = await getAccountState(client, walletContract.address);
    if (walletState === 'active') {
      console.log('Your wallet is active now');
      return;
    }

    await wait(5_000);

    console.log(`Deploying wallet contract... (${tryCount} tries left)`);
  }

  throw new Error(`Wallet deployment failed, please try again later`);
}

async function deployWallet() {
  const client: TonClient4 = await createClient(deployConfig.NETWORK);
  const wallet: Wallet = await createWallet(deployConfig.MNEMONIC);
  const walletContract: WalletContract = await openWallet(wallet, {
    api: deployConfig.NETWORK,
    wallet: wallet,
    storage: {
      pinataApiKey: deployConfig.PINATA_API_KEY,
      pinataSecretKey: deployConfig.PINATA_SECRET,
    }
  });

  const walletAddress = walletContract.address;
  console.log(`Your wallet address in ${deployConfig.NETWORK} is ${toFriendlyAddress(walletAddress, deployConfig.NETWORK)}`);

  const walletBalance = await getAccountBalance(client, walletAddress);
  if (walletBalance < MIN_DEPLOY_BALANCE) {
    console.log(`Please, send at least ${fromNano(MIN_TOP_UP_TON)} TON to your wallet address to continue`);
    console.log(`Use this bot to top up your wallet with test coins: https://t.me/testgiver_ton_bot`);
    await waitForWalletTopUp(client, walletAddress);
  } else {
    console.log(`Your wallet balance is ${fromNano(walletBalance)} TON`);
  }

  const walletState = await getAccountState(client, walletAddress);
  if (walletState !== 'active') {
    console.log('Your wallet is not active. Deploying wallet contract...');
    await waitForWalletDeployment(client, wallet, walletContract);
  }
}

deployWallet();
