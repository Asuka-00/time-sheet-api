import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WebSocketService } from './websocket.service';
import { ERROR_CODES } from '../../common/constants/error-codes';

/**
 * WebSocket网关
 * 处理WebSocket连接、断开和JWT认证
 */
@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: true,
    },
})
export class PermissionWebSocketGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(PermissionWebSocketGateway.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly websocketService: WebSocketService,
    ) {}

    /**
     * 网关初始化
     * @param server Socket.IO服务器实例
     */
    afterInit(server: Server): void {
        this.websocketService.setServer(server);
        this.logger.log('WebSocket网关已初始化');
    }

    /**
     * 处理客户端连接
     * @param client Socket客户端
     */
    handleConnection(client: Socket): void {
        try {
            this.logger.log(`客户端尝试连接: ${client.id}`);

            // 提取JWT token
            const token = this.extractToken(client);
            if (!token) {
                this.logger.warn(`客户端 ${client.id} 缺少认证令牌`);
                client.emit('error', {
                    code: ERROR_CODES.WEBSOCKET.AUTH.NO_TOKEN,
                    message: 'WebSocket缺少认证令牌',
                });
                client.disconnect();
                return;
            }

            // 验证JWT token
            const userCode = this.validateToken(token);
            if (!userCode) {
                this.logger.warn(`客户端 ${client.id} 令牌无效`);
                client.emit('error', {
                    code: ERROR_CODES.WEBSOCKET.AUTH.INVALID_TOKEN,
                    message: 'WebSocket令牌无效',
                });
                client.disconnect();
                return;
            }

            // 注册连接
            this.websocketService.registerClient(userCode, client.id);

            // 发送连接成功消息
            client.emit('connected', {
                message: '连接成功',
                userCode,
                timestamp: Date.now(),
            });

            this.logger.log(`用户 ${userCode} 连接成功，socketId: ${client.id}`);
        } catch (error) {
            const err = error as Error;
            this.logger.error(`处理连接失败: ${err.message}`, err.stack);
            client.emit('error', {
                code: ERROR_CODES.WEBSOCKET.CONNECTION.FAILED,
                message: 'WebSocket连接失败',
            });
            client.disconnect();
        }
    }

    /**
     * 处理客户端断开
     * @param client Socket客户端
     */
    handleDisconnect(client: Socket): void {
        this.logger.log(`客户端断开连接: ${client.id}`);
        this.websocketService.unregisterClient(client.id);
    }

    /**
     * 从Socket握手中提取JWT token
     * @param client Socket客户端
     * @returns JWT token或null
     */
    private extractToken(client: Socket): string | null {
        // 尝试从auth对象获取
        if (client.handshake.auth?.token) {
            return client.handshake.auth.token;
        }

        // 尝试从headers获取
        const authHeader = client.handshake.headers.authorization;
        if (authHeader) {
            const parts = authHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                return parts[1];
            }
        }

        return null;
    }

    /**
     * 验证JWT token并提取userCode
     * @param token JWT token
     * @returns userCode或null
     */
    private validateToken(token: string): string | null {
        try {
            const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
            const payload = this.jwtService.verify(token, { secret });

            if (payload && payload.userCode && payload.type === 'access') {
                return payload.userCode;
            }

            return null;
        } catch (error) {
            const err = error as Error;
            this.logger.debug(`Token验证失败: ${err.message}`);
            return null;
        }
    }
}
