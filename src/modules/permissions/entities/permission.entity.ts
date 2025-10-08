import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    menuName: string;

    @Column()
    code: string;

    @Column()
    module: string;

    @Column({ nullable: true })
    parentCode: string;

    @Column({ nullable: true })
    type: string;

    @Column({ nullable: true })
    path: string;

    @Column({ nullable: true })
    icon: string;

    @Column({ nullable: true })
    component: string;

    @Column({ default: 0 })
    sort: number;

    @Column()
    description: string;

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
