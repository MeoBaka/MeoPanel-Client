import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameTwoFactorAuthTable1734946700000 implements MigrationInterface {
    name = 'RenameTwoFactorAuthTable1734946700000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`two_factor_auth\` RENAME TO \`twofa_auth\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`twofa_auth\` RENAME TO \`two_factor_auth\``);
    }

}