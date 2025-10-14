import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class ProjectDto {
    @ApiProperty({ description: '项目ID', required: false })
    @IsOptional()
    @IsString()
    uuid?: string;

    @ApiProperty({ description: '项目编码', required: true })
    @IsNotEmpty({ message: '项目编码不能为空' })
    @IsString()
    projectCode: string;

    @ApiProperty({ description: '项目名称', required: true })
    @IsNotEmpty({ message: '项目名称不能为空' })
    @IsString()
    projectName: string;

    @ApiProperty({ description: '项目描述', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: '项目经理用户编码', required: true })
    @IsNotEmpty({ message: '项目经理不能为空' })
    @IsString()
    managerUserCode: string;

    @ApiProperty({ description: '项目总监用户编码', required: true })
    @IsNotEmpty({ message: '项目总监不能为空' })
    @IsString()
    directorUserCode: string;

    @ApiProperty({ description: '项目开始日期', required: false, example: '2025-01-01' })
    @IsOptional()
    @IsDateString()
    startDate?: Date;

    @ApiProperty({ description: '项目结束日期', required: false, example: '2025-12-31' })
    @IsOptional()
    @IsDateString()
    endDate?: Date;

    @ApiProperty({
        description: '项目状态：1-进行中，2-已完成，3-已取消',
        required: false,
        default: 1,
    })
    @IsOptional()
    @IsNumber()
    status?: number;
}
