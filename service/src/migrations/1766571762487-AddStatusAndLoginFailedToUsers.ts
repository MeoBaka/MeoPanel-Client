import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusAndLoginFailedToUsers1766571762487 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users ADD status int NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE users ADD login_failed int NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users DROP COLUMN login_failed`);
        await queryRunner.query(`ALTER TABLE users DROP COLUMN status`);
    }

}
