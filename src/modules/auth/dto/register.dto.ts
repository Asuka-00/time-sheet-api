import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

/**
 * 注册请求DTO
 */
export class RegisterDto {
    @ApiProperty({ description: '用户编码', example: 'user001' })
    @IsString()
    userCode: string;

    @ApiProperty({ description: '用户名称', example: '张三' })
    @IsString()
    userName: string;

    @ApiProperty({ description: '密码', example: 'password123' })
    @IsString()
    @MinLength(6, { message: '密码长度至少为6位' })
    password: string;
}
