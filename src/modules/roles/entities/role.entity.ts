import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Role {
    @ApiProperty({ description: '角色ID', required: true })
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @ApiProperty({ description: '角色名称', required: true })
    @Column()
    name: string;

    @ApiProperty({ description: '角色描述', required: true })
    @Column()
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
