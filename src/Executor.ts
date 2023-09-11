import { GameFiSDK, HighloadWalletV2, SbtCollection, Jetton } from "@ton-community/gamefi-sdk";
import { Address, MessageRelaxed, ContractProvider, internal, toNano, Cell, SendMode } from "@ton/core";
import { Action } from "./actions";

export class Executor {
    private batches: Action[][] = [];

    constructor(
        private sdk: GameFiSDK,
        private wallet: HighloadWalletV2,
        private secretKey: Buffer,
    ) {}

    execute(batch: Action[]) {
        // if batches was not empty, then there is an execution in-flight which will pick up the new batch automatically
        this.batches.push(batch);
        if (this.batches.length > 1) {
            return;
        }
        this.executionThread();
    }

    private async executeOne(batch: Action[]) {
        const sbts: Map<string, Address[]> = new Map();
        const jettons: Map<string, Map<string, bigint>> = new Map();
        for (const action of batch) {
            if (action.type === 'jetton') {
                const minterAddr = action.minter.toString();
                let localMap = jettons.get(minterAddr);
                if (localMap === undefined) {
                    localMap = new Map();
                    jettons.set(minterAddr, localMap);
                }
                const toAddr = action.to.toString();
                localMap.set(toAddr, (localMap.get(toAddr) ?? 0n) + action.amount);
            } else {
                const collectionAddr = action.collection.toString();
                let localArray = sbts.get(collectionAddr);
                if (localArray === undefined) {
                    localArray = [];
                    sbts.set(collectionAddr, localArray);
                }
                localArray.push(action.owner);
            }
        }
        const messages: MessageRelaxed[] = [];
        const makeProvider = (addr: Address): ContractProvider => {
            const p = this.sdk.api.provider(addr);
            return {
                getState: () => p.getState(),
                get: (...args) => p.get(...args),
                internal: async (via, args) => {
                    messages.push(internal({
                        to: addr,
                        value: args.value,
                        bounce: args.bounce,
                        body: args.body,
                    }));
                },
                external: async () => {
                    throw new Error('Unsupported');
                },
            };
        };
        for (const [collectionAddrStr, owners] of sbts) {
            const collectionAddr = Address.parse(collectionAddrStr);
            const provider = makeProvider(collectionAddr);
            const collection = SbtCollection.open(collectionAddr, {} as any); // passing {} as a sender to avoid NoSenderError
            const index = (await collection.getData(provider)).nextItemIndex;
            await collection.sendBatchMint(provider, {
                requestValue: BigInt(owners.length) * toNano('0.04'),
                requests: owners.map((o, i) => ({
                    itemIndex: index + BigInt(i),
                    value: toNano('0.03'),
                    itemParams: {
                        owner: o,
                        individualContent: new Cell(),
                        authority: this.wallet.address,
                    },
                })),
            });
        }
        for (const [jettonAddrStr, mintRequests] of jettons) {
            const jettonAddr = Address.parse(jettonAddrStr);
            const provider = makeProvider(jettonAddr);
            const jetton = Jetton.open(jettonAddr, {} as any);
            for (const [ownerAddrStr, amount] of mintRequests) {
                await jetton.sendMint(provider, {
                    to: Address.parse(ownerAddrStr),
                    amount,
                });
            }
        }
        const w = this.sdk.api.open(this.wallet);
        await w.sendTransferAndWait({
            sendMode: SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS,
            secretKey: this.secretKey,
            messages,
        });
    }

    private async executionThread() {
        while (this.batches.length > 0) {
            const batch = this.batches[0];
            await this.executeOne(batch);
            this.batches.shift(); // remove the batch late, so that other "threads" may see that an execution "thread" is running and insert their own batches instead of launching a new execution "thread"
        }
    }
}
