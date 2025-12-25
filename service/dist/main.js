"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const security_exception_filter_1 = require("./auth/security.exception-filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalFilters(new security_exception_filter_1.SecurityExceptionFilter());
    app.enableCors({
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    const port = process.env.SERVICE_PORT;
    if (!port) {
        throw new Error('SERVICE_PORT is not defined in environment variables');
    }
    await app.listen(port);
    console.log(`Service is running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map