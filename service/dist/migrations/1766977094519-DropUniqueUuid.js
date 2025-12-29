"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropUniqueUuid1766977094519 = void 0;
class DropUniqueUuid1766977094519 {
    constructor() {
        this.name = 'DropUniqueUuid1766977094519';
    }
    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX \`IDX_94f6e4ba4e7b0c222713d5c2c2\` ON \`wservers\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`name\` \`name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`email_verified_at\` \`email_verified_at\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`twofa_auth\` CHANGE \`backup_codes\` \`backup_codes\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`password_reset_tokens\` CHANGE \`expires_at\` \`expires_at\` timestamp NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`email_verification_tokens\` CHANGE \`expires_at\` \`expires_at\` timestamp NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`auth_sessions\` CHANGE \`refresh_expires_at\` \`refresh_expires_at\` timestamp NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`auth_sessions\` CHANGE \`device_id\` \`device_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`auth_sessions\` CHANGE \`user_agent\` \`user_agent\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`auth_sessions\` CHANGE \`ip_address\` \`ip_address\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`auth_sessions\` CHANGE \`last_used_at\` \`last_used_at\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` DROP FOREIGN KEY \`FK_bd2726fd31b35443f2245b93ba0\``);
        await queryRunner.query(`DROP INDEX \`IDX_2f68e345c05e8166ff9deea1ab\` ON \`audit_logs\``);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`user_id\` \`user_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`details\` \`details\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`ip_address\` \`ip_address\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`user_agent\` \`user_agent\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`session_id\` \`session_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` DROP COLUMN \`metadata\``);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` ADD \`metadata\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`auth_login_logs\` CHANGE \`session_id\` \`session_id\` varchar(36) NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_2f68e345c05e8166ff9deea1ab\` ON \`audit_logs\` (\`user_id\`, \`created_at\`)`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` ADD CONSTRAINT \`FK_bd2726fd31b35443f2245b93ba0\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`audit_logs\` DROP FOREIGN KEY \`FK_bd2726fd31b35443f2245b93ba0\``);
        await queryRunner.query(`DROP INDEX \`IDX_2f68e345c05e8166ff9deea1ab\` ON \`audit_logs\``);
        await queryRunner.query(`ALTER TABLE \`auth_login_logs\` CHANGE \`session_id\` \`session_id\` varchar(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` DROP COLUMN \`metadata\``);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` ADD \`metadata\` longtext COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`session_id\` \`session_id\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`user_agent\` \`user_agent\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`ip_address\` \`ip_address\` varchar(45) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`details\` \`details\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`user_id\` \`user_id\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`CREATE INDEX \`IDX_2f68e345c05e8166ff9deea1ab\` ON \`audit_logs\` (\`user_id\`, \`created_at\`)`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` ADD CONSTRAINT \`FK_bd2726fd31b35443f2245b93ba0\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`auth_sessions\` CHANGE \`last_used_at\` \`last_used_at\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`auth_sessions\` CHANGE \`ip_address\` \`ip_address\` varchar(45) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`auth_sessions\` CHANGE \`user_agent\` \`user_agent\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`auth_sessions\` CHANGE \`device_id\` \`device_id\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`auth_sessions\` CHANGE \`refresh_expires_at\` \`refresh_expires_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`email_verification_tokens\` CHANGE \`expires_at\` \`expires_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`password_reset_tokens\` CHANGE \`expires_at\` \`expires_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`twofa_auth\` CHANGE \`backup_codes\` \`backup_codes\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`email_verified_at\` \`email_verified_at\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`name\` \`name\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_94f6e4ba4e7b0c222713d5c2c2\` ON \`wservers\` (\`uuid\`)`);
    }
}
exports.DropUniqueUuid1766977094519 = DropUniqueUuid1766977094519;
//# sourceMappingURL=1766977094519-DropUniqueUuid.js.map