import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Achievement } from "./achievements";
import { Address, Cell, TonClient4, Transaction } from '@ton/ton';
import { AppDataSource } from "./data-source";
import { Executor } from "./Executor";
import { GameFiSDK, createHighloadV2 } from '@ton-community/gamefi-sdk';
import { Global } from './entity/Global';
import { In } from 'typeorm';
import { Item } from './entity/Item';
import { Purchase } from './entity/Purchase';
import { Scheduler } from "./Scheduler";
import { User } from "./entity/User";
import { config } from './config';
import { getHttpV4Endpoint } from '@orbs-network/ton-access';
import { processTelegramData } from "./telegram";
import { z } from 'zod';

const PROCESS_INTERVAL = 10000;
const { NETWORK, TOKEN_MINTER, ACHIEVEMENT_COLLECTION } = config;

const playedRequest = z.object({
    tg_data: z.string(),
    wallet: z.string().optional(),
    score: z.number().int(),
});

function parseTransferNotification(cell: Cell): {
    queryId: bigint,
    amount: bigint,
    sender: Address,
    forwardPayload: Cell,
} {
    const s = cell.beginParse();
    if (s.loadUint(32) !== 0x7362d09c) {
        throw new Error('Invalid opcode');
    }
    return {
        queryId: s.loadUintBig(64),
        amount: s.loadCoins(),
        sender: s.loadAddress(),
        forwardPayload: s.loadBoolean() ? s.loadRef() : s.asCell(),
    };
}

function parsePurchaseRequest(tx: Transaction, acceptFrom: Address) {
    try {
        if (!tx.inMessage) throw new Error('No message');
        if (!(tx.inMessage.info.src instanceof Address) || !tx.inMessage.info.src.equals(acceptFrom)) throw new Error('Invalid sender');
        const parsed = parseTransferNotification(tx.inMessage.body);
        const fs = parsed.forwardPayload.beginParse();
        const op = fs.loadUint(32);
        if (op !== 0) throw new Error('Invalid opcode');
        const msg = fs.loadStringTail();
        const parts = msg.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid message');
        }
        return {
            userID: Number(parts[0]),
            itemID: Number(parts[1]),
            amount: parsed.amount,
            hash: tx.hash(),
            lt: tx.lt,
        };
    } catch (e) {}
    return undefined;
}

type PurchaseRequest = { userID: number, itemID: number, amount: bigint, hash: Buffer, lt: bigint };

async function findPurchaseRequests(client: TonClient4, address: Address, acceptFrom: Address, from: { hash: Buffer, lt: bigint }, known?: { hash: Buffer, lt: bigint }): Promise<PurchaseRequest[]> {
    const prs: PurchaseRequest[] = [];
    let curHash = from.hash;
    let curLt = from.lt;
    let first = true;
    mainLoop: while (true) {
        const txs = await client.getAccountTransactions(address, curLt, curHash);
        if (first) {
            first = false;
        } else {
            txs.shift();
            if (txs.length === 0) break;
        }
        for (const tx of txs) {
            if (known !== undefined && tx.tx.hash().equals(known.hash) && tx.tx.lt === known.lt) break mainLoop;
            const pr = parsePurchaseRequest(tx.tx, acceptFrom);
            if (pr !== undefined) prs.push(pr);
        }
        curHash = txs[txs.length-1].tx.hash();
        curLt = txs[txs.length-1].tx.lt;
    }
    return prs;
}

function sleep(timeout: number): Promise<void> {
    return new Promise((res) => {
        setTimeout(() => res(), timeout);
    });
}

async function processTxsForever(address: Address, client: TonClient4, acceptFrom: Address, known?: { hash: Buffer, lt: bigint }) {
    while (true) {
        await sleep(PROCESS_INTERVAL);
        known = await processTxs(address, client, acceptFrom, known);
    }
}

async function processTxs(address: Address, client: TonClient4, acceptFrom: Address, known?: { hash: Buffer, lt: bigint }): Promise<{ hash: Buffer, lt: bigint } | undefined> {
    try {
        const lastBlock = await client.getLastBlock()
        const acc = await client.getAccountLite(lastBlock.last.seqno, address)
        if (acc.account.last === null) return undefined;
        if (known !== undefined && acc.account.last.hash === known.hash.toString('base64') && acc.account.last.lt === known.lt.toString()) return known;
        const newKnown = {
            hash: Buffer.from(acc.account.last.hash, 'base64'),
            lt: BigInt(acc.account.last.lt),
        };
        let purchaseRequests: { userID: number, itemID: number, amount: bigint, hash: Buffer, lt: bigint }[] = await findPurchaseRequests(client, address, acceptFrom, newKnown, known);
        const itemIDs = Array.from(new Set(purchaseRequests.map(p => p.itemID)));
        const items = await AppDataSource.getRepository(Item).find({
            where: {
                id: In(itemIDs),
            },
        });
        const itemsMap = new Map(items.map(it => [it.id, it]));
        purchaseRequests = purchaseRequests.filter(pr => {
            const it = itemsMap.get(pr.itemID);
            return it !== undefined && pr.amount >= it.cost;
        });
        await Promise.allSettled(purchaseRequests.map(it => AppDataSource.getRepository(Purchase).createQueryBuilder().insert().values({
            user: { id: it.userID },
            item: { id: it.itemID },
            txHash: it.hash.toString('base64'),
            txLt: it.lt.toString(),
        }).orIgnore().execute()));
        await AppDataSource.getRepository(Global).createQueryBuilder().insert().values({
            key: 'last_known_tx',
            value: newKnown.hash.toString('base64') + ':' + newKnown.lt.toString(),
        }).orUpdate(['value'], ['key']).execute();
        return newKnown;
    } catch (e) {
        return known;
    }
}

async function main() {
    await AppDataSource.initialize();

    const highload = await createHighloadV2(config.MNEMONIC!);

    const sdk = await GameFiSDK.create({
        api: NETWORK,
        wallet: highload,
        storage: {
            pinataApiKey: config.PINATA_API_KEY!,
            pinataSecretKey: config.PINATA_SECRET!,
        },
    });

    const executor = new Executor(sdk, highload.wallet, highload.keyPair.secretKey);
    const scheduler = new Scheduler(executor);

    const fastify = Fastify({
        logger: true
    });

    if (config.CORS_ENABLED) {
        fastify.register(cors, {
            origin: config.CORS_ORIGIN!,
        });
    }

    fastify.post('/played', async function handler (request, reply) {
        const req = playedRequest.parse(request.body);

        let reqWallet: Address | undefined = undefined;
        if (req.wallet !== undefined) {
            try {
                reqWallet = Address.parse(req.wallet);
            } catch (e) {}
        }

        const telegramData = processTelegramData(req.tg_data, config.TELEGRAM_BOT_TOKEN!);

        if (!telegramData.ok) return { ok: false };

        const parsedUser = JSON.parse(telegramData.data.user);
        const userID: number = parsedUser.id;

        const result: { ok: false } | { ok: true, plays: number, previousHighScore?: number, wallet: string } = await AppDataSource.transaction(async (tx) => {
            const user = await tx.findOneBy(User, { id: userID });
            if (user === null) {
                if (reqWallet === undefined) return { ok: false };
                const newUser = new User();
                newUser.highScore = req.score;
                newUser.id = userID;
                newUser.wallet = reqWallet.toString({
                    urlSafe: true,
                    bounceable: false,
                    testOnly: false,
                });
                newUser.plays = 1;
                await tx.save(newUser);
                return { ok: true, plays: newUser.plays, wallet: newUser.wallet };
            } else {
                user.plays++;
                if (reqWallet !== undefined) {
                    user.wallet = reqWallet.toString({
                        urlSafe: true,
                        bounceable: false,
                        testOnly: false,
                    });
                }
                let previousHighScore: number | undefined = undefined;
                if (req.score > user.highScore) {
                    previousHighScore = user.highScore;
                    user.highScore = req.score;
                }
                await tx.save(user);
                return { ok: true, plays: user.plays, previousHighScore, wallet: user.wallet };
            }
        });

        if (!result.ok) return { ok: false };

        let rewardTokens = 1;
        const prevTen = Math.floor((result.previousHighScore ?? 0) / 10);
        const newTen = Math.floor(req.score / 10);
        if (newTen > prevTen) {
            rewardTokens += (newTen - prevTen) * 10;
        }

        const newAchievements: Achievement[] = [];
        if (result.plays === 1) {
            newAchievements.push('first-time');
        } else if (result.plays === 5) {
            newAchievements.push('five-times');
        }

        const recipient = Address.parse(result.wallet);
        for (const ach of newAchievements) {
            scheduler.schedule({
                type: 'sbt',
                collection: ACHIEVEMENT_COLLECTION[ach],
                owner: recipient,
            });
        }
        scheduler.schedule({
            type: 'jetton',
            to: recipient,
            amount: BigInt(rewardTokens),
            minter: TOKEN_MINTER,
        });

        return { ok: true, reward: rewardTokens, achievements: newAchievements };
    });

    fastify.get('/config', async function handler (request, reply) {
        const tokenMinterAddress = TOKEN_MINTER.toString({testOnly: NETWORK === 'testnet'});
        const achievementCollection = Object.fromEntries(
          Object.entries(ACHIEVEMENT_COLLECTION)
            .map(([k, v]) => [k, v.toString({testOnly: NETWORK === 'testnet'})])
        );

        const acceptFrom = sdk.sender?.address!;
        const tokenRecipient = acceptFrom.toString({testOnly: NETWORK === 'testnet'});

        return {
            ok: true,
            config: {
                network: NETWORK,
                tokenMinter: tokenMinterAddress,
                tokenRecipient: tokenRecipient,
                achievementCollection: achievementCollection,
            },
        }
    });

    fastify.get('/purchases', async function handler (request, reply) {
        const telegramData = processTelegramData((request.query as any).auth, config.TELEGRAM_BOT_TOKEN!);

        if (!telegramData.ok) return { ok: false };

        const parsedUser = JSON.parse(telegramData.data.user);
        const userID: number = parsedUser.id;

        const purchases = await AppDataSource.getRepository(Purchase).find({
            where: {
                user: { id: userID },
            },
            relations: {
                item: true,
            }
        });

        const result = purchases.map(p => ({ itemID: p.item.id, name: p.item.name, systemName: p.item.systemName, type: p.item.type, }));

        return { ok: true, purchases: result };
    });

    let known: { hash: Buffer, lt: bigint } | undefined = undefined;
    const knownDb = await AppDataSource.getRepository(Global).findOneBy({
        key: 'last_known_tx',
    });
    if (knownDb !== null) {
        const parts = knownDb.value.split(':');
        known = {
            hash: Buffer.from(parts[0], 'base64'),
            lt: BigInt(parts[1]),
        };
    }
    const client = new TonClient4({
        endpoint: await getHttpV4Endpoint({ network: NETWORK }),
    });
    const acceptFrom = await sdk.openJetton(TOKEN_MINTER).getWalletAddress(sdk.sender?.address!);

    processTxsForever(sdk.sender?.address!, client, acceptFrom, known);

    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

main();

