import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JWT认证守卫
 * 自动验证所有请求的JWT token
 * 使用@Public()装饰器可以跳过验证
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    /**
     * 判断是否可以激活路由
     * @param context 执行上下文
     */
    canActivate(context: ExecutionContext) {
        // 检查是否标记为公开端点
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // 公开端点直接放行
        if (isPublic) {
            return true;
        }

        // 执行JWT验证
        return super.canActivate(context);
    }
}
