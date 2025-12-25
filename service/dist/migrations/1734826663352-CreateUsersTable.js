"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUsersTable1734826663352 = void 0;
class CreateUsersTable1734826663352 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` bigint NOT NULL,
                \`name\` varchar(255),
                \`username\` varchar(255) NOT NULL,
                \`email\` varchar(255),
                \`email_verified_at\` TIMESTAMP,
                \`status\` smallint NOT NULL DEFAULT '0',
                \`login_failed\` integer NOT NULL DEFAULT '0',
                \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT \`PK_4c88e956195bba85977da21b8f4\` PRIMARY KEY (\`id\`)
            )
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE \`users\``);
    }
}
exports.CreateUsersTable1734826663352 = CreateUsersTable1734826663352;
//# sourceMappingURL=1734826663352-CreateUsersTable.js.map