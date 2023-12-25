import {readFileSync} from "fs";
import {resolve} from "path";

export const JETTON_CONTENT_TEMPLATE = {
  uri: "https://github.com/ton-community/flappy-bird-server/",
  name: "Flappy Jetton",
  description: "A vibrant digital token from the Flappy Bird universe. Flappy Jetton is your gateway to exclusive in-game features and rewards.",
  symbol: "FLAP",
  decimals: 0,
  amountStyle: "n",
  renderType: "currency"
} as const;

export const JETTON_IMAGE = readFileSync(resolve(__dirname, './image.png'));
