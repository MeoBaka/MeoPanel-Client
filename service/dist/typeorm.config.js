"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: '../.env' });
const typeorm_1 = require("typeorm");
exports.default = new typeorm_1.DataSource({
    type: 'mysql',
    url: process.env.DATABASE_URL,
    entities: ['src/entities/*.ts'],
    migrations: ['src/migrations/*.ts'],
});
//# sourceMappingURL=typeorm.config.js.map