import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { RequestContextService } from '../context/request-context.service';

/**
 * 请求上下文拦截器
 * 在 Guards 执行后设置 AsyncLocalStorage 上下文
 * 将 JWT 验证后的用户信息注入到上下文中，供 AuditSubscriber 使用
 */
@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // 获取 HTTP 请求对象
        const request = context.switchToHttp().getRequest();

        // 从 JWT 守卫验证后的 request.user 中提取 userCode
        const user = request.user;
        const userCode = user?.userCode;

        // 使用 AsyncLocalStorage 运行后续请求处理
        // 需要将 Observable 转换为 Promise，在 AsyncLocalStorage 上下文中执行
        return from(
            new Promise((resolve, reject) => {
                RequestContextService.run({ userCode }, () => {
                    next.handle().toPromise().then(resolve).catch(reject);
                });
            }),
        );
    }
}
