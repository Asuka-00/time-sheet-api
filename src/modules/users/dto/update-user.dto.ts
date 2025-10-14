import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
    @ApiProperty({ description: '用户ID', required: true })
    @IsString()
    uuid: string;

    @ApiProperty({ description: '用户代码', required: false })
    @IsOptional()
    @IsString()
    userCode?: string;

    @ApiProperty({ description: '用户邮箱', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ description: '用户手机号', required: false })
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @ApiProperty({ description: '用户名称', required: false })
    @IsOptional()
    @IsString()
    userName?: string;

    @ApiProperty({ description: '用户角色', required: false })
    @IsOptional()
    @IsString()
    roleName?: string;

    @ApiProperty({ description: '用户部门', required: false })
    @IsOptional()
    @IsString()
    departmentName?: string;

    @ApiProperty({ description: '用户时区', required: false, example: 'Asia/Shanghai' })
    @IsOptional()
    @IsString()
    timezone?: string;

    @ApiProperty({ description: '用户状态', required: false })
    @IsOptional()
    @IsNumber()
    status?: number;
}
