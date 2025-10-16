import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsDateString,
    IsArray,
    ArrayNotEmpty,
} from 'class-validator';

export class ProjectMemberDto {
    @ApiProperty({ description: '项目成员ID', required: false })
    @IsOptional()
    @IsString()
    uuid?: string;

    @ApiProperty({ description: '项目编码', required: true })
    @IsNotEmpty({ message: '项目编码不能为空' })
    @IsString()
    projectCode: string;

    @ApiProperty({ description: '成员用户编码', required: true })
    @IsNotEmpty({ message: '成员用户编码不能为空' })
    @IsString()
    userCode: string;

    @ApiProperty({ description: '成员角色（如：开发、测试、设计等）', required: false })
    @IsOptional()
    @IsString()
    role?: string;

    @ApiProperty({ description: '加入日期', required: false, example: '2025-01-01' })
    @IsOptional()
    @IsDateString()
    joinDate?: Date;
}

export class BatchAddProjectMembersDto {
    @ApiProperty({ description: '项目编码', required: true })
    @IsNotEmpty({ message: '项目编码不能为空' })
    @IsString()
    projectCode: string;

    @ApiProperty({
        description: '成员用户编码列表',
        required: true,
        type: [String],
        example: ['S0001', 'S0002', 'S0003'],
    })
    @IsNotEmpty({ message: '成员用户编码列表不能为空' })
    @IsArray()
    @ArrayNotEmpty({ message: '成员用户编码列表不能为空' })
    @IsString({ each: true })
    userCodes: string[];

    @ApiProperty({ description: '成员角色（统一角色）', required: false })
    @IsOptional()
    @IsString()
    role?: string;

    @ApiProperty({ description: '加入日期（统一日期）', required: false, example: '2025-01-01' })
    @IsOptional()
    @IsDateString()
    joinDate?: Date;
}
