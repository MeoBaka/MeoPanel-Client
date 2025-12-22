"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveUserColumns1734897165000 = void 0;
class RemoveUserColumns1734897165000 {
    constructor() {
        this.name = 'RemoveUserColumns1734897165000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`email_verified_at\`, DROP COLUMN \`status\`, DROP COLUMN \`login_failed\``);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`email_verified_at\` timestamp NULL, ADD \`status\` smallint NOT NULL DEFAULT 0, ADD \`login_failed\` int NOT NULL DEFAULT 0`);
    }
}
exports.RemoveUserColumns1734897165000 = RemoveUserColumns1734897165000;
//# sourceMappingURL=1734897165000-RemoveUserColumns.js.map