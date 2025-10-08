import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTimesheetDto } from './create-timesheet.dto';
import { VALIDATION_CODES } from 'src/common';

export class BatchCreateTimesheetDto {
    @ApiProperty({
        description: '工时记录列表',
        required: true,
        type: [CreateTimesheetDto],
        example: [
            {
                projectCode: 'PRJ001',
                workDate: '2025-10-01',
                hours: 8,
                description: '完成用户登录模块开发',
            },
            {
                projectCode: 'PRJ002',
                workDate: '2025-10-01',
                hours: 4,
                description: '完成数据库设计文档',
            },
        ],
    })
    @IsNotEmpty({ message: VALIDATION_CODES.TIMESHEET.RECORDS_REQUIRED })
    @IsArray({ message: VALIDATION_CODES.TIMESHEET.RECORDS_MUST_BE_ARRAY })
    @ArrayMinSize(1, { message: VALIDATION_CODES.TIMESHEET.RECORDS_MIN_SIZE })
    @ArrayMaxSize(50, { message: VALIDATION_CODES.TIMESHEET.RECORDS_MAX_SIZE })
    @ValidateNested({ each: true })
    @Type(() => CreateTimesheetDto)
    timesheets: CreateTimesheetDto[];
}
