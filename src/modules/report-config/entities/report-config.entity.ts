import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ReportConfig {
    @ApiProperty({ description: '配置ID', required: true })
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @ApiProperty({ description: '报表类型', required: true })
    @Column({ unique: true })
    reportType: string;

    @ApiProperty({ description: '报表名称', required: true })
    @Column()
    reportName: string;

    @ApiProperty({ description: 'Cron表达式', required: true })
    @Column()
    cronExpression: string;

    @ApiProperty({ description: '接收邮箱列表(逗号分隔)', required: true })
    @Column({ type: 'text' })
    recipientEmails: string;

    @ApiProperty({ description: '项目编号(逗号分隔)', required: false })
    @Column({ type: 'text', nullable: true })
    filterConditions: string;

    @ApiProperty({ description: '是否启用', required: true })
    @Column({ default: true })
    isEnabled: boolean;

    @ApiProperty({ description: '配置描述', required: false })
    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    createdBy: string;

    @Column({ nullable: true, type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: true })
    updatedBy: string;

    @Column({ nullable: true, type: 'datetime' })
    updatedAt: Date;
}
