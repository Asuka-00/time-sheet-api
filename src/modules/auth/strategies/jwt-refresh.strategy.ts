import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../users/user.service';
import { JwtPayload } from './jwt-access.strategy';
import { ERROR_CODES } from '../../../common/constants/error-codes';

/**
 * JWT刷新令牌验证策略
 * 验证Refresh Token
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {
        const secret = configService.get<string>('JWT_REFRESH_SECRET');
        if (!secret) {
            throw new Error(ERROR_CODES.AUTH.CONFIG.JWT_SECRET_MISSING);
        }
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    /**
     * 验证JWT payload
     * @param payload JWT解码后的payload
     * @returns 用户信息
     */
    async validate(payload: JwtPayload) {
        // 验证token类型
        if (payload.type !== 'refresh') {
            throw new UnauthorizedException({
                errorCode: ERROR_CODES.AUTH.TOKEN.INVALID_TYPE,
            });
        }

        // 查询用户信息
        const user = await this.userService.findByUserCode(payload.userCode);
        if (!user) {
            throw new UnauthorizedException({
                errorCode: ERROR_CODES.AUTH.TOKEN.USER_NOT_FOUND,
            });
        }

        // 验证用户状态
        if (user.status !== 1) {
            throw new UnauthorizedException({
                errorCode: ERROR_CODES.AUTH.TOKEN.USER_DISABLED,
            });
        }

        // 返回用户信息（不包含密码）
        const { password: _password, ...userInfo } = user;
        return userInfo;
    }
}
