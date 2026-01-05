const { execSync } = require('child_process');

require('dotenv').config({ path: '../.env' });

process.env.PORT = process.env.FRONTEND_PORT;

execSync('npx next dev', { stdio: 'inherit', env: process.env });