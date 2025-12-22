import { config } from 'dotenv';
config({ path: '../.env' });
import { readFileSync } from 'fs';
import { DataSource } from 'typeorm';

export default new DataSource({
    type: 'mysql',
    url: process.env.DATABASE_URL,
    entities: ['src/entities/*.ts'],
    migrations: ['src/migrations/*.ts'],
});
