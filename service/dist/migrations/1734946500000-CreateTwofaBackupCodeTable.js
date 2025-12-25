"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTwofaBackupCodeTable1734946500000 = void 0;
class CreateTwofaBackupCodeTable1734946500000 {
    constructor() {
        this.name = 'CreateTwofaBackupCodeTable1734946500000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE \`twofa_backupcode\` (
                \`id\` varchar(36) NOT NULL,
                \`user_id\` varchar(36) NOT NULL,
                \`code_hash\` varchar(255) NOT NULL,
                \`is_used\` tinyint NOT NULL DEFAULT 0,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                KEY \`FK_twofa_backupcode_user_id\` (\`user_id\`),
                CONSTRAINT \`FK_twofa_backupcode_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`uuid\`) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE \`twofa_backupcode\``);
    }
}
exports.CreateTwofaBackupCodeTable1734946500000 = CreateTwofaBackupCodeTable1734946500000;
//# sourceMappingURL=1734946500000-CreateTwofaBackupCodeTable.js.map