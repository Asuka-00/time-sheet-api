import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class ReportConfigDto {
    @ApiProperty({ description: '配置ID', required: false })
    @IsOptional()
    @IsString()
    uuid?: string;

    @ApiProperty({ description: '报表类型', required: true, example: 'MONTHLY_PROJECT_SUMMARY' })
    @IsNotEmpty({ message: '报表类型不能为空' })
    @IsString()
    reportType: string;

    @ApiProperty({ description: '报表名称', required: true, example: '月度项目汇总报表' })
    @IsNotEmpty({ message: '报表名称不能为空' })
    @IsString()
    reportName: string;

    @ApiProperty({ description: 'Cron表达式', required: true, example: '0 0 9 1 * *' })
    @IsNotEmpty({ message: 'Cron表达式不能为空' })
    @IsString()
    cronExpression: string;

    @ApiProperty({
        description: '接收邮箱列表(逗号分隔)',
        required: true,
        example: 'manager1@example.com,manager2@example.com',
    })
    @IsNotEmpty({ message: '接收邮箱列表不能为空' })
    @IsString()
    recipientEmails: string;

    @ApiProperty({
        description: '项目编号(逗号分隔)',
        required: false,
        example: 'P001,P002,P003',
    })
    @IsOptional()
    @IsString()
    filterConditions?: string;

    @ApiProperty({ description: '是否启用', required: false, default: true })
    @IsOptional()
    @IsBoolean()
    isEnabled?: boolean;

    @ApiProperty({ description: '配置描述', required: false })
    @IsOptional()
    @IsString()
    description?: string;
}
