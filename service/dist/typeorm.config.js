"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fs_1 = require("fs");
const typeorm_1 = require("typeorm");
exports.default = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: {
        ca: (0, fs_1.readFileSync)('certs/ca.crt').toString(),
    },
    entities: ['src/entities/*.ts'],
    migrations: ['src/migrations/*.ts'],
});
//# sourceMappingURL=typeorm.config.js.map