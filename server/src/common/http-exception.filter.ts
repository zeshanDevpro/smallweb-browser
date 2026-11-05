import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';

type ErrorCode = 'INVALID' | 'TAKEN' | 'NOT_FOUND';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;
    const message = this.getMessage(exceptionResponse);
    const code: ErrorCode =
      status === HttpStatus.CONFLICT
        ? 'TAKEN'
        : status === HttpStatus.NOT_FOUND
          ? 'NOT_FOUND'
          : 'INVALID';

    response.status(status).json({ code, message });
  }

  private getMessage(exceptionResponse: unknown): string {
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const { message } = exceptionResponse;
      if (typeof message === 'string') return message;
      if (Array.isArray(message)) {
        return message.filter((item): item is string => typeof item === 'string').join(', ');
      }
    }
    return typeof exceptionResponse === 'string'
      ? exceptionResponse
      : 'An unexpected error occurred.';
  }
}
