import dotenv from 'dotenv';
import {Address} from "@ton/core";
import {Achievement} from "./achievements";
import {deployConfig, DeployConfig} from "./deploy-config";

dotenv.config();

if (!process.env.JETTON_ADDRESS) {
  throw new Error('JETTON_ADDRESS is not set');
}

if (!process.env.FIRST_TIME_SBT_COLLECTION_ADDRESS) {
  throw new Error('FIRST_TIME_SBT_COLLECTION_ADDRESS is not set');
}

if (!process.env.FIVE_TIMES_SBT_COLLECTION_ADDRESS) {
  throw new Error('FIVE_TIMES_SBT_COLLECTION_ADDRESS is not set');
}

export interface Config extends DeployConfig {
  TOKEN_MINTER: Address;
  ACHIEVEMENT_COLLECTION: Record<Achievement, Address>;
}

export const config: Config = {
  ...deployConfig,
  TOKEN_MINTER: Address.parse(process.env.JETTON_ADDRESS),
  ACHIEVEMENT_COLLECTION: {
    'first-time': Address.parse(process.env.FIRST_TIME_SBT_COLLECTION_ADDRESS),
    'five-times': Address.parse(process.env.FIVE_TIMES_SBT_COLLECTION_ADDRESS),
  },
};
