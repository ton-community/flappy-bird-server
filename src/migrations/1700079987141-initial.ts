import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1700079987141 implements MigrationInterface {
    name = 'Initial1700079987141'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "item" ("id" SERIAL NOT NULL, "cost" integer NOT NULL, "name" character varying NOT NULL, "systemName" character varying NOT NULL, "type" character varying NOT NULL, CONSTRAINT "PK_d3c0c71f23e7adcf952a1d13423" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "purchase" ("id" SERIAL NOT NULL, "txHash" character varying(44) NOT NULL, "txLt" bigint NOT NULL, "userId" integer, "itemId" integer, CONSTRAINT "user_item" UNIQUE ("userId", "itemId"), CONSTRAINT "PK_86cc2ebeb9e17fc9c0774b05f69" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer NOT NULL, "wallet" character varying(48) NOT NULL, "highScore" integer NOT NULL DEFAULT '0', "plays" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "global" ("key" character varying NOT NULL, "value" character varying NOT NULL, CONSTRAINT "PK_c4f437957afe434e75cd32b3515" PRIMARY KEY ("key"))`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD CONSTRAINT "FK_33520b6c46e1b3971c0a649d38b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD CONSTRAINT "FK_859729cff68dea71a165722f4cb" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP CONSTRAINT "FK_859729cff68dea71a165722f4cb"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP CONSTRAINT "FK_33520b6c46e1b3971c0a649d38b"`);
        await queryRunner.query(`DROP TABLE "global"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "purchase"`);
        await queryRunner.query(`DROP TABLE "item"`);
    }

}
