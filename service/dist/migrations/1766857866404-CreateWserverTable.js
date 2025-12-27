"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWserverTable1766857866404 = void 0;
class CreateWserverTable1766857866404 {
    constructor() {
        this.name = 'CreateWserverTable1766857866404';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`twofa_backupcode\` DROP FOREIGN KEY \`FK_twofa_backupcode_user_id\``);
        await queryRunner.query(`CREATE TABLE \`wservers\` (\`server_uuid\` varchar(36) NOT NULL, \`servername\` varchar(255) NOT NULL, \`url\` varchar(500) NOT NULL, \`uuid\` varchar(255) NOT NULL, \`token\` varchar(500) NOT NULL, \`created_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_94f6e4ba4e7b0c222713d5c2c2\` (\`uuid\`), PRIMARY KEY (\`server_uuid\`)) ENGINE=InnoDB`);
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
        await queryRunner.query(`ALTER TABLE \`auth_login_logs\` CHANGE \`session_id\` \`session_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`twofa_backupcode\` DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`twofa_backupcode\` ADD \`user_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`DROP INDEX \`IDX_2f68e345c05e8166ff9deea1ab\` ON \`audit_logs\``);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`user_id\` \`user_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`details\` \`details\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`ip_address\` \`ip_address\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`user_agent\` \`user_agent\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`session_id\` \`session_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` DROP COLUMN \`metadata\``);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` ADD \`metadata\` json NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_2f68e345c05e8166ff9deea1ab\` ON \`audit_logs\` (\`user_id\`, \`created_at\`)`);
        await queryRunner.query(`ALTER TABLE \`twofa_auth\` ADD CONSTRAINT \`FK_865db1b9921aedff38f53c01b5a\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`password_reset_tokens\` ADD CONSTRAINT \`FK_52ac39dd8a28730c63aeb428c9c\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`email_verification_tokens\` ADD CONSTRAINT \`FK_fdcb77f72f529bf65c95d72a147\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`auth_sessions\` ADD CONSTRAINT \`FK_50ccaa6440288a06f0ba693ccc6\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`auth_login_logs\` ADD CONSTRAINT \`FK_92a625e10ddbb7ec154bf6f6a7a\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`auth_credentials\` ADD CONSTRAINT \`FK_8555dcc06a7fc7fa9844a5e7245\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`twofa_backupcode\` ADD CONSTRAINT \`FK_3e27c475c9bdf5bbb18b2ef2e6d\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` ADD CONSTRAINT \`FK_bd2726fd31b35443f2245b93ba0\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`audit_logs\` DROP FOREIGN KEY \`FK_bd2726fd31b35443f2245b93ba0\``);
        await queryRunner.query(`ALTER TABLE \`twofa_backupcode\` DROP FOREIGN KEY \`FK_3e27c475c9bdf5bbb18b2ef2e6d\``);
        await queryRunner.query(`ALTER TABLE \`auth_credentials\` DROP FOREIGN KEY \`FK_8555dcc06a7fc7fa9844a5e7245\``);
        await queryRunner.query(`ALTER TABLE \`auth_login_logs\` DROP FOREIGN KEY \`FK_92a625e10ddbb7ec154bf6f6a7a\``);
        await queryRunner.query(`ALTER TABLE \`auth_sessions\` DROP FOREIGN KEY \`FK_50ccaa6440288a06f0ba693ccc6\``);
        await queryRunner.query(`ALTER TABLE \`email_verification_tokens\` DROP FOREIGN KEY \`FK_fdcb77f72f529bf65c95d72a147\``);
        await queryRunner.query(`ALTER TABLE \`password_reset_tokens\` DROP FOREIGN KEY \`FK_52ac39dd8a28730c63aeb428c9c\``);
        await queryRunner.query(`ALTER TABLE \`twofa_auth\` DROP FOREIGN KEY \`FK_865db1b9921aedff38f53c01b5a\``);
        await queryRunner.query(`DROP INDEX \`IDX_2f68e345c05e8166ff9deea1ab\` ON \`audit_logs\``);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` DROP COLUMN \`metadata\``);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` ADD \`metadata\` longtext COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`session_id\` \`session_id\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`user_agent\` \`user_agent\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`ip_address\` \`ip_address\` varchar(45) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`details\` \`details\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`user_id\` \`user_id\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`CREATE INDEX \`IDX_2f68e345c05e8166ff9deea1ab\` ON \`audit_logs\` (\`user_id\`, \`created_at\`)`);
        await queryRunner.query(`ALTER TABLE \`twofa_backupcode\` DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`twofa_backupcode\` ADD \`user_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`auth_login_logs\` CHANGE \`session_id\` \`session_id\` varchar(36) NULL DEFAULT 'NULL'`);
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
        await queryRunner.query(`DROP INDEX \`IDX_94f6e4ba4e7b0c222713d5c2c2\` ON \`wservers\``);
        await queryRunner.query(`DROP TABLE \`wservers\``);
        await queryRunner.query(`ALTER TABLE \`twofa_backupcode\` ADD CONSTRAINT \`FK_twofa_backupcode_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`uuid\`) ON DELETE CASCADE ON UPDATE RESTRICT`);
    }
}
exports.CreateWserverTable1766857866404 = CreateWserverTable1766857866404;
//# sourceMappingURL=1766857866404-CreateWserverTable.js.map