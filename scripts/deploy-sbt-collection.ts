import {createSdk, createWallet, toFriendlyAddress, Wallet} from "./utils/sdk";
import {deployConfig} from "../workspaces/server/src/deploy-config";
import {GameFiSDK, NftContent} from "@ton-community/gamefi-sdk";
import {FIVE_TIMES_CONTENT_TEMPLATE, FIVE_TIMES_IMAGE} from './tokens/five-times/content-template';
import {FIRST_TIME_CONTENT_TEMPLATE, FIRST_TIME_IMAGE} from "./tokens/first-time/content-template";

let SBT_CONTENT_TEMPLATE: NftContent;
let SBT_IMAGE: Buffer;

const COLLECTION_NAME = process.argv[2];
switch (process.argv[2]) {
  case 'first-time':
    SBT_CONTENT_TEMPLATE = FIRST_TIME_CONTENT_TEMPLATE;
    SBT_IMAGE = FIRST_TIME_IMAGE;
    break;
  case 'five-times':
    SBT_CONTENT_TEMPLATE = FIVE_TIMES_CONTENT_TEMPLATE;
    SBT_IMAGE = FIVE_TIMES_IMAGE;
    break;
  default:
    throw new Error(`Unknown collection name: ${COLLECTION_NAME}`);
}

async function deploySbtCollection() {
  const wallet: Wallet = await createWallet(deployConfig.MNEMONIC);
  const sdk: GameFiSDK = await createSdk({
    api: deployConfig.NETWORK,
    wallet: wallet,
    storage: {
      pinataApiKey: deployConfig.PINATA_API_KEY,
      pinataSecretKey: deployConfig.PINATA_SECRET,
    }
  });

  const adminAddress = wallet.wallet.address;
  const imageUrl = await sdk.storage.uploadFile(SBT_IMAGE);

  const content: NftContent = {
    ...SBT_CONTENT_TEMPLATE,
    image: imageUrl,
  };

  // upload nft content, same for all nfts in the collection
  const commonContent = await sdk.storage.uploadFile(Buffer.from(JSON.stringify(content), 'utf-8'));

  const sbtContract = await sdk.createSbtCollection({
    collectionContent: content,
    commonContent: commonContent
  }, {
    adminAddress: adminAddress,
  });

  console.log(toFriendlyAddress(sbtContract.address, deployConfig.NETWORK));
}

deploySbtCollection();
