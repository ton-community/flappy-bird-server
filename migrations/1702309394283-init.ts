import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1702309394283 implements MigrationInterface {
    name = 'Init1702309394283'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "cost" integer NOT NULL, "name" varchar NOT NULL, "systemName" varchar NOT NULL, "type" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "purchase" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "txHash" varchar(44) NOT NULL, "txLt" bigint NOT NULL, "userId" bigint, "itemId" integer, CONSTRAINT "user_item" UNIQUE ("userId", "itemId"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" bigint PRIMARY KEY NOT NULL, "wallet" varchar(48) NOT NULL, "highScore" integer NOT NULL DEFAULT (0), "plays" integer NOT NULL DEFAULT (0))`);
        await queryRunner.query(`CREATE TABLE "global" ("key" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "temporary_purchase" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "txHash" varchar(44) NOT NULL, "txLt" bigint NOT NULL, "userId" bigint, "itemId" integer, CONSTRAINT "user_item" UNIQUE ("userId", "itemId"), CONSTRAINT "FK_33520b6c46e1b3971c0a649d38b" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_859729cff68dea71a165722f4cb" FOREIGN KEY ("itemId") REFERENCES "item" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_purchase"("id", "txHash", "txLt", "userId", "itemId") SELECT "id", "txHash", "txLt", "userId", "itemId" FROM "purchase"`);
        await queryRunner.query(`DROP TABLE "purchase"`);
        await queryRunner.query(`ALTER TABLE "temporary_purchase" RENAME TO "purchase"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" RENAME TO "temporary_purchase"`);
        await queryRunner.query(`CREATE TABLE "purchase" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "txHash" varchar(44) NOT NULL, "txLt" bigint NOT NULL, "userId" bigint, "itemId" integer, CONSTRAINT "user_item" UNIQUE ("userId", "itemId"))`);
        await queryRunner.query(`INSERT INTO "purchase"("id", "txHash", "txLt", "userId", "itemId") SELECT "id", "txHash", "txLt", "userId", "itemId" FROM "temporary_purchase"`);
        await queryRunner.query(`DROP TABLE "temporary_purchase"`);
        await queryRunner.query(`DROP TABLE "global"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "purchase"`);
        await queryRunner.query(`DROP TABLE "item"`);
    }

}
