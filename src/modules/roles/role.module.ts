import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { UserModule } from '../users/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([Role, RolePermission]), forwardRef(() => UserModule)],
    controllers: [RoleController],
    providers: [RoleService],
    exports: [RoleService],
})
export class RoleModule {}
