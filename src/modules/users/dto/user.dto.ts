import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class UserDto {
    @ApiProperty({ description: '用户ID', required: false })
    @IsOptional()
    @IsString()
    uuid?: string;

    @ApiProperty({ description: '用户代码', required: true })
    @IsString()
    userCode: string;

    @ApiProperty({ description: '用户邮箱', required: true })
    @IsEmail()
    email: string;

    @ApiProperty({ description: '用户手机号', required: true })
    @IsString()
    phoneNumber: string;

    @ApiProperty({ description: '用户名称', required: true })
    @IsString()
    userName: string;

    @ApiProperty({ description: '用户密码', required: true })
    @IsString()
    password: string;

    @ApiProperty({ description: '用户角色ID', required: true })
    @IsString()
    roleName: string;

    @ApiProperty({ description: '用户部门ID', required: true })
    @IsString()
    departmentName: string;

    @ApiProperty({ description: '用户时区', required: false, example: 'Asia/Shanghai' })
    @IsOptional()
    @IsString()
    timezone?: string;

    @ApiProperty({ description: '用户状态', required: true })
    @IsNumber()
    status: number;
}
