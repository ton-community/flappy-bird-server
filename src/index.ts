import 'dotenv/config';
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import Fastify from 'fastify';
import { z } from 'zod';
import { Address } from '@ton/ton';
import { GameFiSDK, createHighloadV2 } from '@ton-community/gamefi-sdk';
import { processTelegramData } from "./telegram";
import { Executor } from "./Executor";
import { Scheduler } from "./Scheduler";
import { Achievement } from "./achievements";
import { config } from './consts';
import cors from '@fastify/cors';

const { tokenMinter, achievementCollections } = config;

const playedRequest = z.object({
    tg_data: z.string(),
    wallet: z.string().optional(),
    score: z.number().int(),
});

async function main() {
    await AppDataSource.initialize();

    const highload = await createHighloadV2(process.env.MNEMONIC!);

    const sdk = await GameFiSDK.create({
        api: 'testnet',
        wallet: highload,
        storage: {
            pinataApiKey: process.env.PINATA_API!,
            pinataSecretKey: process.env.PINATA_SECRET!,
        },
    });

    const executor = new Executor(sdk, highload.wallet, highload.keyPair.secretKey);
    const scheduler = new Scheduler(executor);

    const fastify = Fastify({
        logger: true
    });
    fastify.register(cors, {
        origin: 'https://krigga.github.io',
    });

    fastify.post('/played', async function handler (request, reply) {
        const req = playedRequest.parse(request.body);

        const telegramData = processTelegramData(req.tg_data, process.env.BOT_TOKEN!);

        if (!telegramData.ok) return { ok: false };

        const parsedUser = JSON.parse(telegramData.data.user);
        const userID: number = parsedUser.id;

        const result: { ok: false } | { ok: true, plays: number, previousHighScore?: number, wallet: string } = await AppDataSource.transaction(async (tx) => {
            const user = await tx.findOneBy(User, { id: userID });
            if (user === null) {
                if (req.wallet === undefined) return { ok: false };
                const addr = Address.parse(req.wallet);
                const newUser = new User();
                newUser.highScore = req.score;
                newUser.id = userID;
                newUser.wallet = addr.toString({
                    urlSafe: true,
                    bounceable: false,
                    testOnly: false,
                });
                newUser.plays = 1;
                await tx.save(newUser);
                return { ok: true, plays: newUser.plays, wallet: newUser.wallet };
            } else {
                user.plays++;
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
        if (result.previousHighScore !== undefined) {
            const prevTen = Math.floor(result.previousHighScore / 10);
            const newTen = Math.floor(req.score / 10);
            if (newTen > prevTen) {
                rewardTokens += (newTen - prevTen) * 10;
            }
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
                collection: achievementCollections[ach],
                owner: recipient,
            });
        }
        scheduler.schedule({
            type: 'jetton',
            to: recipient,
            amount: BigInt(rewardTokens),
            minter: tokenMinter,
        });

        return { ok: true, reward: rewardTokens, achievements: newAchievements };
    })

    try {
        await fastify.listen({ port: 3000 })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

main();

