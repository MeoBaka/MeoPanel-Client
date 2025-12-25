"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenameIdToUuid1766427876462 = void 0;
class RenameIdToUuid1766427876462 {
    constructor() {
        this.name = 'RenameIdToUuid1766427876462';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`id\` \`uuid\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`name\` \`name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`email_verified_at\` \`email_verified_at\` timestamp NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`email_verified_at\` \`email_verified_at\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`name\` \`name\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`uuid\` \`id\` varchar(36) NOT NULL`);
    }
}
exports.RenameIdToUuid1766427876462 = RenameIdToUuid1766427876462;
//# sourceMappingURL=1766427876462-RenameIdToUuid.js.map