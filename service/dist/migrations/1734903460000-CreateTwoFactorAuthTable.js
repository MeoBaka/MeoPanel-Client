"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTwoFactorAuthTable1734903460000 = void 0;
class CreateTwoFactorAuthTable1734903460000 {
    constructor() {
        this.name = 'CreateTwoFactorAuthTable1734903460000';
    }
    async up(queryRunner) {
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
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE \`two_factor_auth\``);
    }
}
exports.CreateTwoFactorAuthTable1734903460000 = CreateTwoFactorAuthTable1734903460000;
//# sourceMappingURL=1734903460000-CreateTwoFactorAuthTable.js.map