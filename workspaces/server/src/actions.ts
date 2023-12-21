import { Address } from "@ton/core";

export type SbtAction = { type: 'sbt', collection: Address, owner: Address };
export type JettonAction = { type: 'jetton', minter: Address, to: Address, amount: bigint };
export type Action = SbtAction | JettonAction;
