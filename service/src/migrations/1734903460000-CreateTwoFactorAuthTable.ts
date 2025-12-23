import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTwoFactorAuthTable1734903460000 implements MigrationInterface {
    name = 'CreateTwoFactorAuthTable1734903460000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`two_factor_auth\` (
                \`id\` varchar(36) NOT NULL,
                \`user_id\` varchar(36) NOT NULL,
                \`secret\` varchar(255) NOT NULL,
                \`is_enabled\` tinyint NOT NULL DEFAULT 0,
                \`backup_codes\` varchar(255) NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`two_factor_auth\``);
    }

}