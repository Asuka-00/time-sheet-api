import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

/**
 * 登录请求DTO
 */
export class LoginDto {
    @ApiProperty({ description: '用户编码', example: 'admin' })
    @IsString()
    userCode: string;

    @ApiProperty({ description: '密码', example: 'password123' })
    @IsString()
    @MinLength(6, { message: '密码长度至少为6位' })
    password: string;
}
