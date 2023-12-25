import { deployConfig } from '../workspaces/server/src/deploy-config';
import {createClient, createWallet, getAccountState, openWallet, Wallet, WalletContract} from './utils/sdk';
import {TonClient4} from "@ton/ton";

async function getWalletState() {
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

  console.log(await getAccountState(client, walletAddress));
}

getWalletState();
