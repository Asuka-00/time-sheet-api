import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column()
    userCode: string;

    @Column()
    userName: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    phoneNumber: string;

    @Column({ nullable: true })
    roleName: string;

    @Column({ nullable: true })
    departmentName: string;

    @Column({ nullable: true })
    timezone: string;

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
