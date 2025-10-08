import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RolePermission {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column()
    roleName: string;

    @Column()
    permissionCode: string;

    @Column({ nullable: true })
    createdBy: string;

    @Column({ nullable: true, type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: true })
    updatedBy: string;

    @Column({ nullable: true, type: 'datetime' })
    updatedAt: Date;
}
