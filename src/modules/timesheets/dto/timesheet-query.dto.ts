import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class TimesheetQueryDto {
    @ApiProperty({ description: '当前页码', required: false, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    current?: number = 1;

    @ApiProperty({ description: '每页大小', required: false, default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    size?: number = 10;

    @ApiProperty({ description: '用户编码', required: false })
    @IsOptional()
    @IsString()
    userCode?: string;

    @ApiProperty({ description: '项目编码', required: false })
    @IsOptional()
    @IsString()
    projectCode?: string;

    @ApiProperty({ description: '状态：1-草稿，2-待审核，3-已通过，4-已驳回', required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    status?: number;

    @ApiProperty({ description: '开始日期', required: false, example: '2025-10-01' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({ description: '结束日期', required: false, example: '2025-10-31' })
    @IsOptional()
    @IsDateString()
    endDate?: string;
}
