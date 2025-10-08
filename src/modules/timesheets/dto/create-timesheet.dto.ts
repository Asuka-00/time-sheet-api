import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min, Max, IsDateString } from 'class-validator';
import { VALIDATION_CODES } from 'src/common';

export class CreateTimesheetDto {
    @ApiProperty({ description: '项目编码', required: true, example: 'PRJ001' })
    @IsNotEmpty({ message: VALIDATION_CODES.TIMESHEET.PROJECT_CODE_REQUIRED })
    @IsString()
    projectCode: string;

    @ApiProperty({ description: '工作日期', required: true, example: '2025-10-01' })
    @IsNotEmpty({ message: VALIDATION_CODES.TIMESHEET.WORK_DATE_REQUIRED })
    @IsDateString({}, { message: VALIDATION_CODES.TIMESHEET.WORK_DATE_INVALID })
    workDate: string;

    @ApiProperty({
        description: '工时小时数',
        required: true,
        example: 8,
        minimum: 0.5,
        maximum: 24,
    })
    @IsNotEmpty({ message: VALIDATION_CODES.TIMESHEET.HOURS_REQUIRED })
    @IsNumber({}, { message: VALIDATION_CODES.TIMESHEET.HOURS_MUST_BE_NUMBER })
    @Min(0.5, { message: VALIDATION_CODES.TIMESHEET.HOURS_MIN })
    @Max(24, { message: VALIDATION_CODES.TIMESHEET.HOURS_MAX })
    hours: number;

    @ApiProperty({ description: '工作描述', required: true, example: '完成用户登录模块开发' })
    @IsString()
    description: string;
}
