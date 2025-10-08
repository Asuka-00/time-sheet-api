import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 业务异常类
 * 用于抛出业务逻辑异常，会被全局异常过滤器捕获并转换为Result.error格式
 * @param errorCode - 错误代码，前端将根据此代码显示对应语言的错误消息
 * @param httpStatus - HTTP状态码（可选，默认400）
 * @param params - 错误消息参数（可选，用于动态消息）
 */
export class BusinessException extends HttpException {
    public readonly errorCode: string;
    public readonly params?: Record<string, any>;

    constructor(errorCode: string, httpStatus: number = 400, params?: Record<string, any>) {
        super(
            {
                errorCode,
                httpStatus,
                params,
            },
            HttpStatus.OK, // HTTP状态码仍返回200，业务状态通过errorCode字段区分
        );
        this.errorCode = errorCode;
        this.params = params;
    }
}
