import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsIn } from 'class-validator';

export class ReviewTimesheetDto {
    @ApiProperty({ description: '工时记录ID', required: true })
    @IsNotEmpty({ message: '工时记录ID不能为空' })
    @IsString()
    uuid: string;

    @ApiProperty({ description: '审核结果：3-通过，4-驳回', required: true, enum: [3, 4] })
    @IsNotEmpty({ message: '审核结果不能为空' })
    @IsNumber({}, { message: '审核结果必须为数字' })
    @IsIn([3, 4], { message: '审核结果只能为3(通过)或4(驳回)' })
    status: number;

    @ApiProperty({ description: '审核意见', required: false })
    @IsOptional()
    @IsString()
    reviewComment?: string;
}
