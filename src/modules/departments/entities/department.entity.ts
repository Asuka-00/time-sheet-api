import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Department {
    @ApiProperty({ description: '部门ID', required: true })
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @ApiProperty({ description: '部门名称', required: true })
    @Column({ unique: true })
    name: string;

    @ApiProperty({ description: '部门描述', required: true })
    @Column()
    description: string;

    @ApiProperty({ description: '上级部门名称', required: false })
    @Column({ nullable: true })
    parentDepartmentName: string;

    @ApiProperty({ description: '状态', required: true })
    @Column()
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
