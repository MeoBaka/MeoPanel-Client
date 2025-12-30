import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePM2PermissionsTable1767102251143 implements MigrationInterface {
    name = 'CreatePM2PermissionsTable1767102251143'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`pm2_permissions\` (
                \`uuid\` varchar(36) NOT NULL,
                \`user_id\` varchar(36) NOT NULL,
                \`wserver_id\` varchar(36) NOT NULL,
                \`pm2_process_name\` varchar(255) NOT NULL,
                \`permissions\` text NOT NULL,
                \`created_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`uuid\`),
                UNIQUE KEY \`IDX_pm2_permissions_user_wserver_process\` (\`user_id\`, \`wserver_id\`, \`pm2_process_name\`),
                KEY \`FK_pm2_permissions_user_id\` (\`user_id\`),
                KEY \`FK_pm2_permissions_wserver_id\` (\`wserver_id\`),
                CONSTRAINT \`FK_pm2_permissions_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`uuid\`) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT \`FK_pm2_permissions_wserver_id\` FOREIGN KEY (\`wserver_id\`) REFERENCES \`wservers\` (\`server_uuid\`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`pm2_permissions\``);
    }
}