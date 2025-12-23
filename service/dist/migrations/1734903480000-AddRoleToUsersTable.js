"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRoleToUsersTable1734903480000 = void 0;
class AddRoleToUsersTable1734903480000 {
    constructor() {
        this.name = 'AddRoleToUsersTable1734903480000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD COLUMN \`role\` enum('MEMBER', 'ADMIN', 'OWNER') NOT NULL DEFAULT 'MEMBER'
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`role\``);
    }
}
exports.AddRoleToUsersTable1734903480000 = AddRoleToUsersTable1734903480000;
//# sourceMappingURL=1734903480000-AddRoleToUsersTable.js.map