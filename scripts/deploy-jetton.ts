import {createSdk, createWallet, toFriendlyAddress, Wallet} from "./utils/sdk";
import {deployConfig} from "../workspaces/server/src/deploy-config";
import {GameFiSDK, JettonContent} from "@ton-community/gamefi-sdk";
import {JETTON_CONTENT_TEMPLATE, JETTON_IMAGE} from './tokens/flap/content-template';

async function deployJetton() {
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
  const imageUrl = await sdk.storage.uploadFile(JETTON_IMAGE);

  const content: JettonContent = {
    ...JETTON_CONTENT_TEMPLATE,
    image: imageUrl,
  };
  const jettonContract = await sdk.createJetton(content, {
    adminAddress: adminAddress,
  });

  console.log(toFriendlyAddress(jettonContract.address, deployConfig.NETWORK));
}

deployJetton();
