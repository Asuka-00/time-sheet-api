import { ApiProperty } from '@nestjs/swagger';

export class TimesheetVo {
    @ApiProperty({ description: '工时记录ID' })
    uuid: string;

    @ApiProperty({ description: '工时编码' })
    timesheetCode: string;

    @ApiProperty({ description: '用户编码' })
    userCode: string;

    @ApiProperty({ description: '用户姓名' })
    userName?: string;

    @ApiProperty({ description: '项目编码' })
    projectCode: string;

    @ApiProperty({ description: '项目名称' })
    projectName?: string;

    @ApiProperty({ description: '工作日期' })
    workDate: Date;

    @ApiProperty({ description: '工时小时数' })
    hours: number;

    @ApiProperty({ description: '工作描述' })
    description: string;

    @ApiProperty({ description: '状态：1-草稿，2-待审核，3-已通过，4-已驳回' })
    status: number;

    @ApiProperty({ description: '状态文本' })
    statusText?: string;

    @ApiProperty({ description: '提交审核日期' })
    submitDate?: Date;

    @ApiProperty({ description: '审核人用户编码' })
    reviewerUserCode?: string;

    @ApiProperty({ description: '审核人姓名' })
    reviewerUserName?: string;

    @ApiProperty({ description: '审核日期' })
    reviewDate?: Date;

    @ApiProperty({ description: '审核意见' })
    reviewComment?: string;

    @ApiProperty({ description: '创建人' })
    createdBy?: string;

    @ApiProperty({ description: '创建时间' })
    createdAt?: Date;

    @ApiProperty({ description: '更新人' })
    updatedBy?: string;

    @ApiProperty({ description: '更新时间' })
    updatedAt?: Date;
}
