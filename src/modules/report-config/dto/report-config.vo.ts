import { ApiProperty } from '@nestjs/swagger';
import { ReportConfig } from '../entities/report-config.entity';

export class ReportConfigVo extends ReportConfig {
    @ApiProperty({ description: '接收邮箱数组', required: false, type: [String] })
    recipientEmailsArray?: string[];

    @ApiProperty({ description: '项目编号数组', required: false, type: [String] })
    projectCodes?: string[];
}
