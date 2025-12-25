"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveStatusFromAuthCredentials1766572969904 = void 0;
class RemoveStatusFromAuthCredentials1766572969904 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE auth_credentials DROP COLUMN status`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE auth_credentials ADD status tinyint NOT NULL DEFAULT 0`);
    }
}
exports.RemoveStatusFromAuthCredentials1766572969904 = RemoveStatusFromAuthCredentials1766572969904;
//# sourceMappingURL=1766572969904-RemoveStatusFromAuthCredentials.js.map