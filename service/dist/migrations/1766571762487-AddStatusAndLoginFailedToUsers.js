"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddStatusAndLoginFailedToUsers1766571762487 = void 0;
class AddStatusAndLoginFailedToUsers1766571762487 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE users ADD status int NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE users ADD login_failed int NOT NULL DEFAULT 0`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE users DROP COLUMN login_failed`);
        await queryRunner.query(`ALTER TABLE users DROP COLUMN status`);
    }
}
exports.AddStatusAndLoginFailedToUsers1766571762487 = AddStatusAndLoginFailedToUsers1766571762487;
//# sourceMappingURL=1766571762487-AddStatusAndLoginFailedToUsers.js.map