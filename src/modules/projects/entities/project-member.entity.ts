import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Index(['projectCode', 'userCode'], { unique: true })
export class ProjectMember {
    @ApiProperty({ description: '项目成员ID', required: true })
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @ApiProperty({ description: '项目编码', required: true })
    @Column()
    projectCode: string;

    @ApiProperty({ description: '成员用户编码', required: true })
    @Column()
    userCode: string;

    @ApiProperty({ description: '成员角色（如：开发、测试、设计等）', required: false })
    @Column({ nullable: true })
    role: string;

    @ApiProperty({ description: '加入日期', required: false })
    @Column({ nullable: true, type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    joinDate: Date;

    @Column({ nullable: true })
    createdBy: string;

    @Column({ nullable: true, type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: true })
    updatedBy: string;

    @Column({ nullable: true, type: 'datetime' })
    updatedAt: Date;
}
