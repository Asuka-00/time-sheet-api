import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Index(['userCode', 'workDate'])
export class Timesheet {
    @ApiProperty({ description: '工时记录ID', required: true })
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @ApiProperty({ description: '工时编码', required: true })
    @Column({ unique: true })
    timesheetCode: string;

    @ApiProperty({ description: '用户编码', required: true })
    @Column()
    @Index()
    userCode: string;

    @ApiProperty({ description: '项目编码', required: true })
    @Column()
    @Index()
    projectCode: string;

    @ApiProperty({ description: '工作日期', required: true })
    @Column({ type: 'datetime' })
    workDate: Date;

    @ApiProperty({ description: '工时小时数', required: true })
    @Column({ type: 'real' })
    hours: number;

    @ApiProperty({ description: '工作描述', required: true })
    @Column({ type: 'text' })
    description: string;

    @ApiProperty({ description: '状态：1-草稿，2-待审核，3-已通过，4-已驳回', required: true })
    @Column({ default: 1 })
    @Index()
    status: number;

    @ApiProperty({ description: '提交审核日期', required: false })
    @Column({ nullable: true, type: 'datetime' })
    submitDate: Date;

    @ApiProperty({ description: '审核人用户编码', required: false })
    @Column({ nullable: true })
    reviewerUserCode: string;

    @ApiProperty({ description: '审核日期', required: false })
    @Column({ nullable: true, type: 'datetime' })
    reviewDate: Date;

    @ApiProperty({ description: '审核意见', required: false })
    @Column({ nullable: true, type: 'text' })
    reviewComment?: string;

    @Column({ nullable: true })
    createdBy: string;

    @Column({ nullable: true, type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: true })
    updatedBy: string;

    @Column({ nullable: true, type: 'datetime' })
    updatedAt: Date;
}
