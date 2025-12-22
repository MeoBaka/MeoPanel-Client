import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuthTables1734903445000 implements MigrationInterface {
    name = 'CreateAuthTables1734903445000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`auth_credentials\` (
                \`id\` varchar(36) NOT NULL,
                \`user_id\` varchar(36) NOT NULL,
                \`username\` varchar(255) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`password_hash\` varchar(255) NOT NULL,
                \`status\` tinyint NOT NULL DEFAULT 0,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`auth_sessions\` (
                \`id\` varchar(36) NOT NULL,
                \`user_id\` varchar(36) NOT NULL,
                \`refresh_token\` varchar(512) NOT NULL,
                \`refresh_expires_at\` timestamp NOT NULL,
                \`device_id\` varchar(255) NULL,
                \`user_agent\` text NULL,
                \`ip_address\` varchar(45) NULL,
                \`last_used_at\` timestamp NULL,
                \`status\` tinyint NOT NULL DEFAULT 1,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`auth_login_logs\` (
                \`id\` varchar(36) NOT NULL,
                \`user_id\` varchar(36) NOT NULL,
                \`session_id\` varchar(36) NULL,
                \`ip_address\` varchar(45) NOT NULL,
                \`user_agent\` text NOT NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`auth_login_logs\``);
        await queryRunner.query(`DROP TABLE \`auth_sessions\``);
        await queryRunner.query(`DROP TABLE \`auth_credentials\``);
    }

}