import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUserColumns1734897165000 implements MigrationInterface {
    name = 'RemoveUserColumns1734897165000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`email_verified_at\`, DROP COLUMN \`status\`, DROP COLUMN \`login_failed\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`email_verified_at\` timestamp NULL, ADD \`status\` smallint NOT NULL DEFAULT 0, ADD \`login_failed\` int NOT NULL DEFAULT 0`);
    }

}