import dotenv from 'dotenv';
import {Address} from "@ton/core";
import {Achievement} from "./achievements";
import {Network} from "@orbs-network/ton-access";

dotenv.config();

if (!process.env.DB_HOST) {
  throw new Error('DB_HOST is not set');
}

if (!process.env.DB_PORT) {
  throw new Error('DB_PORT is not set');
}

if (!process.env.DB_NAME) {
  throw new Error('DB_NAME is not set');
}

if (!process.env.DB_USER) {
  throw new Error('DB_USER is not set');
}

if (!process.env.DB_PASSWORD) {
  throw new Error('DB_PASSWORD is not set');
}

if (!process.env.CORS_ENABLED) {
  throw new Error('CORS_ENABLED is not set');
}

if (process.env.CORS_ENABLED !== 'true' && process.env.CORS_ENABLED !== 'false') {
  throw new Error(`CORS_ENABLED is not valid: ${process.env.CORS_ENABLED} is not true or false`);
}

if (process.env.CORS_ENABLED === 'true' && !process.env.CORS_ORIGIN) {
  throw new Error('CORS_ORIGIN is not set');
}

if (!process.env.NGROK_ENABLED) {
  throw new Error('NGROK_ENABLED is not set');
}

if (process.env.NGROK_ENABLED !== 'true' && process.env.NGROK_ENABLED !== 'false') {
  throw new Error(`NGROK_ENABLED is not valid: ${process.env.NGROK_ENABLED} is not true or false`);
}

if (process.env.NGROK_ENABLED === 'true' && !process.env.NGROK_AUTHTOKEN) {
  throw new Error('NGROK_AUTHTOKEN is not set');
}

if (process.env.NGROK_ENABLED === 'true' && !process.env.NGROK_DOMAIN) {
  throw new Error('NGROK_DOMAIN is not set');
}

if (!process.env.NETWORK) {
  throw new Error('NETWORK is not set');
}

if (process.env.NETWORK !== 'mainnet' && process.env.NETWORK !== 'testnet') {
  throw new Error(`NETWORK is not valid: ${process.env.NETWORK} is not mainnet or testnet`);
}

if (!process.env.MNEMONIC) {
  throw new Error('MNEMONIC is not set');
}

if (process.env.MNEMONIC.split(' ').length !== 24) {
  throw new Error(`MNEMONIC is not valid: is not 24 words`);
}

if (!process.env.PINATA_API_KEY) {
  throw new Error('PINATA_API_KEY is not set');
}

if (!process.env.PINATA_SECRET) {
  throw new Error('PINATA_SECRET is not set');
}

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set');
}

if (!process.env.JETTON_ADDRESS) {
  throw new Error('JETTON_ADDRESS is not set');
}

if (!process.env.FIRST_TIME_SBT_COLLECTION_ADDRESS) {
  throw new Error('FIRST_TIME_SBT_COLLECTION_ADDRESS is not set');
}

if (!process.env.FIVE_TIMES_SBT_COLLECTION_ADDRESS) {
  throw new Error('FIVE_TIMES_SBT_COLLECTION_ADDRESS is not set');
}

export interface Config {
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  CORS_ENABLED: boolean;
  CORS_ORIGIN?: string;
  NGROK_ENABLED: boolean;
  NGROK_AUTHTOKEN?: string;
  NGROK_DOMAIN?: string;
  NETWORK: Network;
  MNEMONIC: string;
  PINATA_API_KEY: string;
  PINATA_SECRET: string;
  TELEGRAM_BOT_TOKEN: string;
  TOKEN_MINTER: Address;
  ACHIEVEMENT_COLLECTION: Record<Achievement, Address>;
}

export const config: Config = {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: Number(process.env.DB_PORT),
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  CORS_ENABLED: process.env.CORS_ENABLED === 'true',
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  NGROK_ENABLED: process.env.NGROK_ENABLED === 'true',
  NGROK_AUTHTOKEN: process.env.NGROK_AUTHTOKEN,
  NGROK_DOMAIN: process.env.NGROK_DOMAIN,
  NETWORK: process.env.NETWORK,
  MNEMONIC: process.env.MNEMONIC,
  PINATA_API_KEY: process.env.PINATA_API_KEY,
  PINATA_SECRET: process.env.PINATA_SECRET,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TOKEN_MINTER: Address.parse(process.env.JETTON_ADDRESS),
  ACHIEVEMENT_COLLECTION: {
    'first-time': Address.parse(process.env.FIRST_TIME_SBT_COLLECTION_ADDRESS),
    'five-times': Address.parse(process.env.FIVE_TIMES_SBT_COLLECTION_ADDRESS),
  },
};
