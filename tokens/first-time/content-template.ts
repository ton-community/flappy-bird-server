import {readFileSync} from "fs";
import {resolve} from "path";

export const FIRST_TIME_CONTENT_TEMPLATE = {
  uri: "https://github.com/ton-community/flappy-bird-server/",
  name: "Flappy First Flight",
  description: "Commemorating your inaugural journey in the Flappy Bird game, this NFT captures the thrill of your first flight. Exclusive to first-time players, it's a digital keepsake of your initial leap into the Flappy world on TON.",
} as const;

export const FIRST_TIME_IMAGE = readFileSync(resolve(__dirname, './image.png'));
