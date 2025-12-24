import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveStatusFromAuthCredentials1766572969904 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE auth_credentials DROP COLUMN status`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE auth_credentials ADD status tinyint NOT NULL DEFAULT 0`);
    }

}
