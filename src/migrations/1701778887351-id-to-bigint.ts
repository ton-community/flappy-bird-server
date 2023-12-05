import { MigrationInterface, QueryRunner } from "typeorm"

export class IdToBigint1701778887351 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "id" TYPE bigint');
        await queryRunner.query('ALTER TABLE "purchase" ALTER COLUMN "userId" TYPE bigint');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "id" TYPE integer');
        await queryRunner.query('ALTER TABLE "purchase" ALTER COLUMN "userId" TYPE integer');
    }

}
