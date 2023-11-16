import {Address, TonClient4} from "@ton/ton";
import {getHttpV4Endpoint, Network} from "@orbs-network/ton-access";
import {createHighloadV2, ExtendedOpenedContract, GameFiSDK} from "@ton-community/gamefi-sdk";

export type Wallet = Awaited<ReturnType<typeof createHighloadV2>>;
export type WalletContract =  ExtendedOpenedContract<Wallet['wallet']>;

const NO_BOUNCEABLE = false;

/**
 * Function to create wallet
 * @param mnemonic — mnemonic phrase
 */
export async function createWallet(mnemonic: string): Promise<Wallet> {
  return createHighloadV2(mnemonic);
}

/**
 * Function to create GameFi SDK instance
 */
export async function createSdk(...sdkParams: Parameters<typeof GameFiSDK['create']>): Promise<GameFiSDK> {
  return await GameFiSDK.create(...sdkParams);
}

/**
 * Function to open wallet
 * @param wallet — wallet instance
 * @param sdkParams — GameFi SDK parameters
 */
export async function openWallet(wallet: Wallet, ...sdkParams: Parameters<typeof GameFiSDK['create']>): Promise<WalletContract> {
  const sdk = await createSdk(...sdkParams);
  return sdk.api.open(wallet.wallet);
}

/**
 * Function to get wallet friendly address
 * @param address — wallet address
 * @param network — mainnet or testnet
 */
export function toFriendlyAddress(address: Address, network: Network): string {
  const testOnly = network === 'testnet';
  return address.toString({
    bounceable: NO_BOUNCEABLE,
    testOnly: testOnly
  });
}

/**
 * Function to create TonClient4 instance
 * @param network — mainnet or testnet
 */
export async function createClient(network: Network): Promise<TonClient4> {
  const endpoint = await getHttpV4Endpoint({network: network});
  return new TonClient4({endpoint: endpoint});
}

/**
 * Function to get account info
 * @param client
 * @param walletAddress
 */
export async function getAccountInfo(client: TonClient4, walletAddress: Address) {
  const block = await client.getLastBlock();
  return client.getAccount(block.last.seqno, walletAddress);
}

/**
 * Function to get wallet balance
 * @param client — TonClient4 instance
 * @param walletAddress — wallet address
 */
export async function getAccountBalance(client: TonClient4, walletAddress: Address): Promise<bigint> {
  const account = await getAccountInfo(client, walletAddress);
  return BigInt(account.account.balance.coins);
}

/**
 * Function to get wallet state
 * @param client — TonClient4 instance
 * @param walletAddress — wallet address
 */
export async function getAccountState(client: TonClient4, walletAddress: Address): Promise<'uninit' | 'active' | 'frozen'> {
  const account = await getAccountInfo(client, walletAddress);
  return account.account.state.type;
}
