import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Item } from "./entity/Item"
import { Purchase } from "./entity/Purchase"
import { Global } from "./entity/Global"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    username: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    synchronize: false,
    logging: true,
    entities: [User, Item, Purchase, Global],
    migrations: [],
    subscribers: [],
})
