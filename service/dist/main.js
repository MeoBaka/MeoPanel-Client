"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const port = process.env.SERVICE_PORT;
    if (!port) {
        throw new Error('SERVICE_PORT is not defined in environment variables');
    }
    await app.listen(port);
    console.log(`Service is running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map