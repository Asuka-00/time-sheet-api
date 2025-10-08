import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseSeederService } from './database-seeder.service';
import { User } from '../users/entities/user.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { RolePermission } from '../roles/entities/role-permission.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Permission, Role, RolePermission])],
    providers: [DatabaseSeederService],
    exports: [DatabaseSeederService],
})
export class DatabaseSeederModule {}
