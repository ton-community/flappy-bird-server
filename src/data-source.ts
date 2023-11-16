import "reflect-metadata"
import { DataSource } from "typeorm"
import { config } from "./config";
import { User } from "./entity/User"
import { Item } from "./entity/Item"
import { Purchase } from "./entity/Purchase"
import { Global } from "./entity/Global"
import { resolve } from 'path';

export const AppDataSource = new DataSource({
    type: "postgres",
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    synchronize: false,
    logging: true,
    entities: [User, Item, Purchase, Global],
    migrations: [resolve(__dirname, 'migrations', '*.{ts,js}')],
    migrationsRun: true,
    subscribers: [],
})
