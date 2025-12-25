"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SecurityExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let SecurityExceptionFilter = SecurityExceptionFilter_1 = class SecurityExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(SecurityExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Internal Server Error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            }
            else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const responseObj = exceptionResponse;
                message = responseObj.message || message;
                error = responseObj.error || error;
            }
        }
        else {
            this.logger.error(`Unhandled exception: ${exception}`, exception instanceof Error ? exception.stack : '');
        }
        const sanitizedMessage = this.sanitizeErrorMessage(message);
        const sanitizedError = this.sanitizeErrorMessage(error);
        if (status === common_1.HttpStatus.UNAUTHORIZED || status === common_1.HttpStatus.FORBIDDEN) {
            this.logger.warn(`Security event: ${status} - ${request.method} ${request.url} - IP: ${request.ip} - User-Agent: ${request.get('User-Agent')}`);
        }
        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            error: sanitizedError,
            message: sanitizedMessage,
        };
        response.status(status).json(errorResponse);
    }
    sanitizeErrorMessage(message) {
        if (Array.isArray(message)) {
            return message.map(msg => this.sanitizeSingleMessage(msg)).join(', ');
        }
        return this.sanitizeSingleMessage(message);
    }
    sanitizeSingleMessage(message) {
        const sensitivePatterns = [
            /password/i,
            /token/i,
            /secret/i,
            /key/i,
            /hash/i,
            /salt/i,
            /database/i,
            /connection/i,
            /sql/i,
            /query/i,
            /stack trace/i,
            /at\s+\w+\.\w+\(/i,
        ];
        let sanitized = message;
        sensitivePatterns.forEach(pattern => {
            if (pattern.test(sanitized)) {
                sanitized = 'An error occurred while processing your request';
            }
        });
        return sanitized;
    }
};
exports.SecurityExceptionFilter = SecurityExceptionFilter;
exports.SecurityExceptionFilter = SecurityExceptionFilter = SecurityExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], SecurityExceptionFilter);
//# sourceMappingURL=security.exception-filter.js.map