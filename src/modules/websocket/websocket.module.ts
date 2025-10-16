import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PermissionWebSocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { UserModule } from '../users/user.module';
import { PermissionModule } from '../permissions/permission.module';

/**
 * WebSocket模块
 * 提供实时推送用户权限功能
 */
@Module({
    imports: [
        ConfigModule,
        JwtModule.register({}),
        forwardRef(() => UserModule),
        forwardRef(() => PermissionModule),
    ],
    providers: [PermissionWebSocketGateway, WebSocketService],
    exports: [WebSocketService],
})
export class WebSocketModule {}
