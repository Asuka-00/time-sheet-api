import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto, UserInfoDto } from './dto/auth-response.dto';
import { UserService } from '../users/user.service';
import { Public } from './decorators/public.decorator';
import { Result, SUCCESS_CODES } from '../../common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './decorators/current-user.decorator';

/**
 * 认证控制器
 * 处理登录和token刷新
 */
@ApiTags('认证')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) {}

    /**
     * 用户登录
     */
    @Public()
    @ApiOperation({
        summary: '用户登录',
        description: '使用用户编码和密码登录，返回访问令牌和刷新令牌',
    })
    @ApiResponse({ status: 200, description: '登录成功', type: AuthResponseDto })
    @ApiResponse({ status: 401, description: '用户名或密码错误' })
    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<Result<AuthResponseDto>> {
        const authResponse = await this.authService.login(loginDto.userCode, loginDto.password);
        return Result.success(authResponse, SUCCESS_CODES.AUTH.LOGIN_SUCCESS);
    }

    /**
     * 用户注册
     */
    @Public()
    @ApiOperation({
        summary: '用户注册',
        description: '使用用户编码、用户名和密码注册，注册成功后自动登录并返回令牌',
    })
    @ApiResponse({ status: 201, description: '注册成功', type: AuthResponseDto })
    @ApiResponse({ status: 400, description: '用户已存在' })
    @Post('register')
    async register(@Body() registerDto: RegisterDto): Promise<Result<AuthResponseDto>> {
        const authResponse = await this.authService.register(
            registerDto.userCode,
            registerDto.userName,
            registerDto.password,
        );
        return Result.success(authResponse, SUCCESS_CODES.AUTH.REGISTER_SUCCESS);
    }

    /**
     * 刷新访问令牌
     */
    @Public()
    @UseGuards(AuthGuard('jwt-refresh'))
    @ApiOperation({
        summary: '刷新访问令牌',
        description: '使用刷新令牌获取新的访问令牌',
    })
    @ApiResponse({ status: 200, description: '刷新成功' })
    @ApiResponse({ status: 401, description: '刷新令牌无效或已过期' })
    @Post('refresh')
    async refresh(
        @Body() refreshTokenDto: RefreshTokenDto,
        @CurrentUser('userCode') userCode: string,
    ): Promise<Result<{ accessToken: string }>> {
        const result = await this.authService.refreshAccessToken(userCode);
        return Result.success(result, SUCCESS_CODES.AUTH.REFRESH_TOKEN_SUCCESS);
    }

    /**
     * 获取当前用户信息
     */
    @ApiOperation({
        summary: '获取当前用户信息',
        description: '通过JWT令牌获取当前登录用户的详细信息',
    })
    @ApiResponse({ status: 200, description: '获取成功', type: UserInfoDto })
    @ApiResponse({ status: 401, description: '未授权' })
    @Get('me')
    async getCurrentUser(@CurrentUser('userCode') userCode: string): Promise<Result<UserInfoDto>> {
        const user = await this.userService.findByUserCode(userCode);
        if (!user) {
            return Result.error('用户不存在', 404);
        }

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

        return Result.success(userInfo, SUCCESS_CODES.AUTH.GET_USER_INFO_SUCCESS);
    }
}
