import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1734826663352 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` bigint NOT NULL,
                \`name\` varchar(255),
                \`username\` varchar(255) NOT NULL,
                \`email\` varchar(255),
                \`email_verified_at\` TIMESTAMP,
                \`status\` smallint NOT NULL DEFAULT '0',
                \`login_failed\` integer NOT NULL DEFAULT '0',
                \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT \`PK_4c88e956195bba85977da21b8f4\` PRIMARY KEY (\`id\`)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}