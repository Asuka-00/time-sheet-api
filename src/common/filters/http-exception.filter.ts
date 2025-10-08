import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Result } from '../dto/result.dto';
import { BusinessException } from '../exceptions/business.exception';

/**
 * 全局异常过滤器
 * 捕获所有异常并统一返回Result格式
 * 返回errorCode供前端进行多语言翻译
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let errorCode = 'COMMON.INTERNAL_ERROR';
        let httpStatus = 500;
        let params: Record<string, any> | undefined;

        // 处理BusinessException
        if (exception instanceof BusinessException) {
            status = HttpStatus.OK; // 业务异常返回HTTP 200
            const exceptionResponse = exception.getResponse() as any;
            errorCode = exceptionResponse.errorCode || 'COMMON.INTERNAL_ERROR';
            httpStatus = exceptionResponse.httpStatus || 400;
            params = exceptionResponse.params;
        }
        // 处理HttpException（如UnauthorizedException等）
        else if (exception instanceof HttpException) {
            status = exception.getStatus();
            httpStatus = status;
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const responseObj = exceptionResponse as any;
                // 如果有errorCode则使用，否则使用通用错误代码
                errorCode = responseObj.errorCode || this.getCommonErrorCode(status);
                params = responseObj.params;
            } else {
                errorCode = this.getCommonErrorCode(status);
            }
        }
        // 处理普通Error
        else {
            errorCode = 'COMMON.INTERNAL_ERROR';
            httpStatus = 500;
        }

        // 记录错误日志
        console.error('[Exception Filter]', {
            path: request.url,
            method: request.method,
            errorCode,
            httpStatus,
            message: exception.message,
            stack: exception.stack,
            timestamp: new Date().toISOString(),
        });

        // 返回统一的Result.error格式，包含errorCode和params
        response.status(status).json({
            code: httpStatus,
            message: errorCode, // 使用errorCode作为message字段，前端根据此字段翻译
            data: null,
            errorCode, // 额外的errorCode字段
            params, // 消息参数
        });
    }

    /**
     * 根据HTTP状态码获取通用错误代码
     */
    private getCommonErrorCode(status: number): string {
        switch (status) {
            case 401:
                return 'COMMON.UNAUTHORIZED';
            case 403:
                return 'COMMON.FORBIDDEN';
            case 404:
                return 'COMMON.NOT_FOUND';
            default:
                return 'COMMON.INTERNAL_ERROR';
        }
    }
}
