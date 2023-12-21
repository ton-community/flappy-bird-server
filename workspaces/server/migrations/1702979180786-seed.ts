import { MigrationInterface, QueryRunner } from "typeorm"
import { Item } from "../src/entity/Item"

export class Seed1702979180786 implements MigrationInterface {
    name = 'Seed1702979180786';

    static items = [
        {
            cost: 1,
            name: "Pipe (Red)",
            systemName: "pipe-red",
            type: "pipe",
        }
    ];

    public async up(queryRunner: QueryRunner): Promise<void> {
        await Promise.all(Seed1702979180786.items.map(async item => {
            await queryRunner.manager.save(Item, item);
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await Promise.all(Seed1702979180786.items.map(async item => {
            await queryRunner.manager.delete(Item, item);
        }));
    }
}
