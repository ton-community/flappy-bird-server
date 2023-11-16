import {readFileSync} from "fs";
import {resolve} from "path";

export const FIVE_TIMES_CONTENT_TEMPLATE = {
  uri: "https://github.com/ton-community/flappy-bird-server/",
  name: "Flappy High Fiver",
  description: "Celebrate your persistent play with the Flappy High Fiver NFT! Awarded after five flights in our Flappy Bird game, this NFT symbolizes your growing mastery and commitment, a true mark of a budding Flappy Bird enthusiast.",
} as const;

export const FIVE_TIMES_IMAGE = readFileSync(resolve(__dirname, './image.png'));
