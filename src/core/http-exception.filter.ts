import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { error } from 'console';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        response
            .status(status)
            .json({
                error: 'Payload Too Large',
                message: 'File too large customize',
                statusCode: status
            });
    }
}