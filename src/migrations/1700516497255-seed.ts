import { MigrationInterface, QueryRunner } from "typeorm"
import { Item } from "../entity/Item"

export class Seed1700516497255 implements MigrationInterface {

    static items = [
        {
            cost: 1,
            name: "Pipe (Red)",
            systemName: "pipe-red",
            type: "pipe",
        }
    ];

    public async up(queryRunner: QueryRunner): Promise<void> {
        await Promise.all(Seed1700516497255.items.map(async item => {
            await queryRunner.manager.save(Item, item);
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await Promise.all(Seed1700516497255.items.map(async item => {
            await queryRunner.manager.delete(Item, item);
        }));
    }

}
