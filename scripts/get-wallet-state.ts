import { config } from '../src/config';
import {createClient, createWallet, getAccountState, openWallet, Wallet, WalletContract} from './utils/sdk';
import {TonClient4} from "@ton/ton";

async function getWalletState() {
  const client: TonClient4 = await createClient(config.NETWORK);
  const wallet: Wallet = await createWallet(config.MNEMONIC);
  const walletContract: WalletContract = await openWallet(wallet, {
    api: config.NETWORK,
    wallet: wallet,
    storage: {
      pinataApiKey: config.PINATA_API_KEY,
      pinataSecretKey: config.PINATA_SECRET,
    }
  });

  const walletAddress = walletContract.address;

  console.log(await getAccountState(client, walletAddress));
}

getWalletState();
