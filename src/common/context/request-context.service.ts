import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * 请求上下文接口
 */
export interface IRequestContext {
    userCode?: string;
}

/**
 * 请求上下文服务
 * 使用AsyncLocalStorage在整个请求生命周期内存储当前用户信息
 */
@Injectable()
export class RequestContextService {
    private static asyncLocalStorage = new AsyncLocalStorage<IRequestContext>();

    /**
     * 设置请求上下文
     */
    static run(context: IRequestContext, callback: () => void): void {
        this.asyncLocalStorage.run(context, callback);
    }

    /**
     * 获取当前请求上下文
     */
    static getContext(): IRequestContext | undefined {
        return this.asyncLocalStorage.getStore();
    }

    /**
     * 获取当前用户编码
     */
    static getCurrentUserCode(): string | undefined {
        const context = this.getContext();
        return context?.userCode;
    }

    /**
     * 设置当前用户编码
     */
    static setCurrentUserCode(userCode: string): void {
        const context = this.getContext();
        if (context) {
            context.userCode = userCode;
        }
    }
}
