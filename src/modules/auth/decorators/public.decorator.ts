import { SetMetadata } from '@nestjs/common';

/**
 * 公开端点装饰器常量
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 公开端点装饰器
 * 标记无需JWT认证的端点
 *
 * @example
 * @Public()
 * @Post('login')
 * async login() {}
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
