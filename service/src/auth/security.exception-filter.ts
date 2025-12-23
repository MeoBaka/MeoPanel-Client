import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class SecurityExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SecurityExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        error = responseObj.error || error;
      }
    } else {
      // Log the actual error for debugging but don't expose it to client
      this.logger.error(`Unhandled exception: ${exception}`, exception instanceof Error ? exception.stack : '');
    }

    // Sanitize error message to prevent information leakage
    const sanitizedMessage = this.sanitizeErrorMessage(message);
    const sanitizedError = this.sanitizeErrorMessage(error);

    // Log security-relevant information
    if (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN) {
      this.logger.warn(
        `Security event: ${status} - ${request.method} ${request.url} - IP: ${request.ip} - User-Agent: ${request.get('User-Agent')}`
      );
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

  private sanitizeErrorMessage(message: string | string[]): string {
    // If message is an array, sanitize each element
    if (Array.isArray(message)) {
      return message.map(msg => this.sanitizeSingleMessage(msg)).join(', ');
    }

    return this.sanitizeSingleMessage(message);
  }

  private sanitizeSingleMessage(message: string): string {
    // Remove potentially sensitive information from error messages
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
      /at\s+\w+\.\w+\(/i, // Stack trace patterns
    ];

    let sanitized = message;

    sensitivePatterns.forEach(pattern => {
      if (pattern.test(sanitized)) {
        // Replace sensitive content with generic message
        sanitized = 'An error occurred while processing your request';
      }
    });

    return sanitized;
  }
}