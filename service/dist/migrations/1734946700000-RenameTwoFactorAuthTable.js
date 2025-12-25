"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenameTwoFactorAuthTable1734946700000 = void 0;
class RenameTwoFactorAuthTable1734946700000 {
    constructor() {
        this.name = 'RenameTwoFactorAuthTable1734946700000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`two_factor_auth\` RENAME TO \`twofa_auth\``);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`twofa_auth\` RENAME TO \`two_factor_auth\``);
    }
}
exports.RenameTwoFactorAuthTable1734946700000 = RenameTwoFactorAuthTable1734946700000;
//# sourceMappingURL=1734946700000-RenameTwoFactorAuthTable.js.map