"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const security_exception_filter_1 = require("./auth/security.exception-filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalFilters(new security_exception_filter_1.SecurityExceptionFilter());
    const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'];
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    const port = process.env.SERVICE_PORT;
    const host = process.env.SERVICE_HOST || 'localhost';
    if (!port) {
        throw new Error('SERVICE_PORT is not defined in environment variables');
    }
    await app.listen(port, host);
    console.log(`Service is running on ${host}:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map