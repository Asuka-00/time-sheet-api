import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 当前用户装饰器
 * 从请求对象中提取当前已认证的用户信息
 *
 * @example
 * async getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 *
 * @example
 * // 只获取userCode
 * async createItem(@CurrentUser('userCode') userCode: string) {
 *   // ...
 * }
 */
export const CurrentUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        // 如果指定了属性名，返回该属性值
        return data ? user?.[data] : user;
    },
);
