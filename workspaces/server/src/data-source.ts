import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Item } from "./entity/Item"
import { Purchase } from "./entity/Purchase"
import { Global } from "./entity/Global"
import { resolve } from 'path';

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: resolve(__dirname, '../db.sqlite'),
    synchronize: false,
    logging: true,
    entities: [User, Item, Purchase, Global],
    migrations: [resolve(__dirname, '../migrations', '*.{ts,js}')],
    migrationsRun: true,
    subscribers: [],
})
