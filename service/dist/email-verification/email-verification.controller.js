"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailVerificationController = void 0;
const common_1 = require("@nestjs/common");
const email_verification_service_1 = require("./email-verification.service");
let EmailVerificationController = class EmailVerificationController {
    constructor(emailVerificationService) {
        this.emailVerificationService = emailVerificationService;
    }
    async verifyEmail(body) {
        return this.emailVerificationService.verifyEmail(body.token);
    }
    async resendVerification(body) {
        return this.emailVerificationService.resendVerification(body.email);
    }
};
exports.EmailVerificationController = EmailVerificationController;
__decorate([
    (0, common_1.Post)('verify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailVerificationController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('resend'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailVerificationController.prototype, "resendVerification", null);
exports.EmailVerificationController = EmailVerificationController = __decorate([
    (0, common_1.Controller)('email-verification'),
    __metadata("design:paramtypes", [email_verification_service_1.EmailVerificationService])
], EmailVerificationController);
//# sourceMappingURL=email-verification.controller.js.map