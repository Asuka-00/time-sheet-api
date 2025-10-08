import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Project {
    @ApiProperty({ description: '项目ID', required: true })
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @ApiProperty({ description: '项目编码', required: true })
    @Column({ unique: true })
    projectCode: string;

    @ApiProperty({ description: '项目名称', required: true })
    @Column()
    projectName: string;

    @ApiProperty({ description: '项目描述', required: false })
    @Column({ nullable: true })
    description: string;

    @ApiProperty({ description: '项目经理用户编码', required: true })
    @Column()
    managerUserCode: string;

    @ApiProperty({ description: '项目开始日期', required: false })
    @Column({ nullable: true, type: 'datetime' })
    startDate: Date;

    @ApiProperty({ description: '项目结束日期', required: false })
    @Column({ nullable: true, type: 'datetime' })
    endDate: Date;

    @ApiProperty({ description: '项目状态：1-进行中，2-已完成，3-已取消', required: true })
    @Column({ default: 1 })
    status: number;

    @Column({ nullable: true })
    createdBy: string;

    @Column({ nullable: true, type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: true })
    updatedBy: string;

    @Column({ nullable: true, type: 'datetime' })
    updatedAt: Date;
}
