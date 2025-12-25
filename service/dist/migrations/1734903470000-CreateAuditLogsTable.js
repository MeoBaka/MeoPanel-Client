"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAuditLogsTable1734903470000 = void 0;
class CreateAuditLogsTable1734903470000 {
    constructor() {
        this.name = 'CreateAuditLogsTable1734903470000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE \`audit_logs\` (
                \`id\` varchar(36) NOT NULL,
                \`user_id\` varchar(36) NULL,
                \`action\` varchar(50) NOT NULL,
                \`resource\` varchar(20) NOT NULL,
                \`details\` text NULL,
                \`ip_address\` varchar(45) NULL,
                \`user_agent\` text NULL,
                \`session_id\` varchar(255) NULL,
                \`metadata\` json NULL,
                \`is_success\` tinyint NOT NULL DEFAULT 1,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_audit_logs_user_id_created_at\` (\`user_id\`, \`created_at\`),
                INDEX \`IDX_audit_logs_action_created_at\` (\`action\`, \`created_at\`),
                INDEX \`IDX_audit_logs_resource_created_at\` (\`resource\`, \`created_at\`)
            ) ENGINE=InnoDB
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE \`audit_logs\``);
    }
}
exports.CreateAuditLogsTable1734903470000 = CreateAuditLogsTable1734903470000;
//# sourceMappingURL=1734903470000-CreateAuditLogsTable.js.map