import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsNumber,
    IsString,
    Min,
    Max,
    MinLength,
    IsDateString,
    IsOptional,
} from 'class-validator';

export class UpdateTimesheetDto {
    @ApiProperty({ description: '工时记录ID', required: true })
    @IsNotEmpty({ message: '工时记录ID不能为空' })
    @IsString()
    uuid: string;

    @ApiProperty({ description: '项目编码', required: false })
    @IsOptional()
    @IsString()
    projectCode?: string;

    @ApiProperty({ description: '工作日期', required: false })
    @IsOptional()
    @IsDateString({}, { message: '工作日期格式不正确' })
    workDate?: string;

    @ApiProperty({ description: '工时小时数', required: false })
    @IsOptional()
    @IsNumber({}, { message: '工时小时数必须为数字' })
    @Min(0.5, { message: '工时小时数不能小于0.5' })
    @Max(24, { message: '工时小时数不能大于24' })
    hours?: number;

    @ApiProperty({ description: '工作描述', required: false })
    @IsOptional()
    @IsString()
    @MinLength(10, { message: '工作描述至少需要10个字符' })
    description?: string;
}
