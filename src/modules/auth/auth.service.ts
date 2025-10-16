import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { User } from '../users/entities/user.entity';
import { AuthResponseDto, UserInfoDto } from './dto/auth-response.dto';
import { PermissionService } from '../permissions/permission.service';
import { ERROR_CODES } from '../../common/constants/error-codes';

/**
 * 认证服务
 * 处理登录、token生成和刷新逻辑
 */
@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly permissionService: PermissionService,
    ) {}

    /**
     * 用户注册
     * @param userCode 用户编码
     * @param userName 用户名称
     * @param password 密码
     * @returns 认证响应（包含access token和refresh token）
     */
    async register(userCode: string, userName: string, password: string): Promise<AuthResponseDto> {
        // 创建用户
        await this.userService.createUser({
            userCode,
            userName,
            password,
        });

        // 注册成功后自动登录
        return await this.login(userCode, password);
    }

    /**
     * 用户登录
     * @param userCode 用户编码
     * @param password 密码
     * @returns 认证响应（包含access token和refresh token）
     */
    async login(userCode: string, password: string): Promise<AuthResponseDto> {
        // 验证用户密码
        const user = await this.validateUser(userCode, password);
        if (!user) {
            throw new UnauthorizedException({
                errorCode: ERROR_CODES.AUTH.LOGIN.INVALID_CREDENTIALS,
            });
        }

        // 生成tokens
        const accessToken = this.generateAccessToken(user.userCode);
        const refreshToken = this.generateRefreshToken(user.userCode);

        // 构建用户信息（不包含密码）
        const userInfo: UserInfoDto = {
            uuid: user.uuid,
            userCode: user.userCode,
            userName: user.userName,
            email: user.email,
            roleName: user.roleName,
            departmentName: user.departmentName,
            timezone: user.timezone,
            status: user.status,
        };

        // 获取用户权限菜单树
        const permissionCodes = await this.userService.getUserAllPermissions(user);
        const permissions = await this.permissionService.getUserPermissionTree(permissionCodes);

        // 获取用户按钮权限
        const buttonPermissions =
            await this.permissionService.getUserButtonPermissions(permissionCodes);

        return {
            accessToken,
            refreshToken,
            user: userInfo,
            permissions,
            buttonPermissions,
        };
    }

    /**
     * 刷新访问令牌
     * @param userCode 用户编码（从refresh token中提取）
     * @returns 新的access token
     */
    async refreshAccessToken(userCode: string): Promise<{ accessToken: string }> {
        // 验证用户是否存在且状态正常
        const user = await this.userService.findByUserCode(userCode);
        if (!user || user.status !== 1) {
            throw new UnauthorizedException({
                errorCode: ERROR_CODES.AUTH.TOKEN.USER_DISABLED,
            });
        }

        // 生成新的access token
        const accessToken = this.generateAccessToken(userCode);

        return { accessToken };
    }

    /**
     * 验证用户
     * @param userCode 用户编码
     * @param password 密码
     * @returns 用户信息或null
     */
    private async validateUser(userCode: string, password: string): Promise<User | null> {
        return await this.userService.validateUserPassword(userCode, password);
    }

    /**
     * 生成访问令牌
     * @param userCode 用户编码
     * @returns access token
     */
    private generateAccessToken(userCode: string): string {
        const payload = { userCode, type: 'access' };
        const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
        const expiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m';

        return this.jwtService.sign(payload, {
            secret,
            expiresIn,
        });
    }

    /**
     * 生成刷新令牌
     * @param userCode 用户编码
     * @returns refresh token
     */
    private generateRefreshToken(userCode: string): string {
        const payload = { userCode, type: 'refresh' };
        const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
        const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';

        return this.jwtService.sign(payload, {
            secret,
            expiresIn,
        });
    }
}
