import { PageResult, createPageResult } from './page-result.dto';

/**
 * 统一API响应结果封装类
 * @template T 数据类型
 */
export class Result<T = any> {
    /**
     * 是否成功
     */
    success: boolean;

    /**
     * 响应消息
     */
    message: string;

    /**
     * 响应数据
     */
    data?: T;

    /**
     * 业务状态码
     */
    code: number;

    /**
     * 时间戳
     */
    timestamp: number;

    constructor(success: boolean, message: string, data?: T, code?: number) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.code = code || (success ? 200 : 500);
        this.timestamp = Date.now();
    }

    /**
     * 成功响应
     * @param data 响应数据
     * @param message 响应消息
     * @param code 状态码，默认200
     * @returns Result对象
     */
    static success<T>(data?: T, message: string = '操作成功', code: number = 200): Result<T> {
        return new Result<T>(true, message, data, code);
    }

    /**
     * 失败响应
     * @param message 错误消息
     * @param code 错误码，默认500
     * @param data 可选的错误详情数据
     * @returns Result对象
     */
    static error<T>(message: string = '操作失败', code: number = 500, data?: T): Result<T> {
        return new Result<T>(false, message, data, code);
    }

    /**
     * 分页成功响应
     * @param records 当前页数据列表
     * @param total 总记录数
     * @param current 当前页码
     * @param size 每页大小
     * @param message 响应消息
     * @returns Result对象，包含完整分页信息
     */
    static page<T>(
        records: T[],
        total: number,
        current: number,
        size: number,
        message: string = '查询成功',
    ): Result<PageResult<T>> {
        const pageResult = createPageResult(records, total, current, size);
        return Result.success(pageResult, message);
    }
}
