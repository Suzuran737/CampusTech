import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { errorResponse } from '../interfaces/api-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let code = 50000;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const body = exceptionResponse as Record<string, unknown>;
        if (Array.isArray(body.message)) {
          message = body.message.join('; ');
        } else if (typeof body.message === 'string') {
          message = body.message;
        }
        if (typeof body.code === 'number') {
          code = body.code;
        }
      }

      if (status === HttpStatus.UNAUTHORIZED) {
        code = 40100;
      } else if (status === HttpStatus.FORBIDDEN) {
        code = 40300;
      } else if (status === HttpStatus.NOT_FOUND) {
        code = 40400;
      } else if (status === HttpStatus.CONFLICT) {
        code = 40900;
      } else if (status < 500) {
        code = 40000;
      }
    }

    response.status(status).json(errorResponse(message, code));
  }
}
