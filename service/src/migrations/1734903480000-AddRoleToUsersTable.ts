import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleToUsersTable1734903480000 implements MigrationInterface {
    name = 'AddRoleToUsersTable1734903480000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD COLUMN \`role\` enum('MEMBER', 'ADMIN', 'OWNER') NOT NULL DEFAULT 'MEMBER'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`role\``);
    }

}