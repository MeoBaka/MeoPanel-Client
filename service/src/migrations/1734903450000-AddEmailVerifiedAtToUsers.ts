import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailVerifiedAtToUsers1734903450000 implements MigrationInterface {
    name = 'AddEmailVerifiedAtToUsers1734903450000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`email_verified_at\` timestamp NULL`);

        await queryRunner.query(`
            CREATE TABLE \`email_verification_tokens\` (
                \`id\` varchar(36) NOT NULL,
                \`user_id\` varchar(36) NOT NULL,
                \`token\` varchar(255) NOT NULL,
                \`expires_at\` timestamp NOT NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`password_reset_tokens\` (
                \`id\` varchar(36) NOT NULL,
                \`user_id\` varchar(36) NOT NULL,
                \`token\` varchar(255) NOT NULL,
                \`expires_at\` timestamp NOT NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`password_reset_tokens\``);
        await queryRunner.query(`DROP TABLE \`email_verification_tokens\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`email_verified_at\``);
    }

}