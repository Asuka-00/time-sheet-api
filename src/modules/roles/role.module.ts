import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { UserModule } from '../users/user.module';
import { User } from '../users/entities/user.entity';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Role, RolePermission, User]),
        forwardRef(() => UserModule),
        forwardRef(() => WebSocketModule),
    ],
    controllers: [RoleController],
    providers: [RoleService],
    exports: [RoleService],
})
export class RoleModule {}
