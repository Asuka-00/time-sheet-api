import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Server } from 'socket.io';
import { UserService } from '../users/user.service';
import { PermissionService } from '../permissions/permission.service';
import { PermissionPushDto } from './dto/permission-push.dto';

/**
 * WebSocket服务
 * 负责管理WebSocket连接和推送权限更新
 */
@Injectable()
export class WebSocketService {
    private readonly logger = new Logger(WebSocketService.name);
    private server: Server;
    // 存储用户连接映射: userCode -> socketId
    private readonly connections = new Map<string, string>();

    constructor(
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        @Inject(forwardRef(() => PermissionService))
        private readonly permissionService: PermissionService,
    ) {}

    /**
     * 设置Socket.IO服务器实例
     * @param server Socket.IO服务器实例
     */
    setServer(server: Server): void {
        this.server = server;
        this.logger.log('WebSocket服务器实例已设置');
    }

    /**
     * 注册客户端连接
     * @param userCode 用户编码
     * @param socketId Socket连接ID
     */
    registerClient(userCode: string, socketId: string): void {
        this.connections.set(userCode, socketId);
        this.logger.log(`用户 ${userCode} 已连接，socketId: ${socketId}`);
        this.logger.debug(`当前在线用户数: ${this.connections.size}`);
    }

    /**
     * 注销客户端连接
     * @param socketId Socket连接ID
     */
    unregisterClient(socketId: string): void {
        // 查找并删除该socketId对应的用户
        for (const [userCode, sid] of this.connections.entries()) {
            if (sid === socketId) {
                this.connections.delete(userCode);
                this.logger.log(`用户 ${userCode} 已断开连接`);
                this.logger.debug(`当前在线用户数: ${this.connections.size}`);
                break;
            }
        }
    }

    /**
     * 推送权限给指定用户
     * @param userCode 用户编码
     */
    async pushPermissions(userCode: string): Promise<void> {
        try {
            const socketId = this.connections.get(userCode);
            if (!socketId) {
                this.logger.debug(`用户 ${userCode} 未在线，跳过推送`);
                return;
            }

            // 获取用户信息
            const user = await this.userService.findByUserCode(userCode);
            if (!user) {
                this.logger.warn(`用户 ${userCode} 不存在`);
                return;
            }

            // 获取用户权限
            const permissionCodes = await this.userService.getUserAllPermissions(user);
            const permissions = await this.permissionService.getUserPermissionTree(permissionCodes);
            const buttonPermissions =
                await this.permissionService.getUserButtonPermissions(permissionCodes);

            // 构造推送数据
            const pushData: PermissionPushDto = {
                permissions,
                buttonPermissions,
                timestamp: Date.now(),
            };

            // 推送给客户端
            this.server.to(socketId).emit('permission:updated', pushData);
            this.logger.log(`成功推送权限给用户 ${userCode}`);
        } catch (error) {
            this.logger.error(`推送权限失败: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * 批量推送权限给多个用户
     * @param userCodes 用户编码数组
     */
    async pushPermissionsToUsers(userCodes: string[]): Promise<void> {
        this.logger.log(`批量推送权限给 ${userCodes.length} 个用户`);

        const promises = userCodes.map((userCode) =>
            this.pushPermissions(userCode).catch((error) => {
                this.logger.error(`推送权限给用户 ${userCode} 失败: ${error.message}`);
                // 继续处理其他用户，不中断批量操作
            }),
        );

        await Promise.all(promises);
        this.logger.log(`批量推送完成`);
    }

    /**
     * 获取当前在线用户数
     */
    getOnlineUserCount(): number {
        return this.connections.size;
    }

    /**
     * 检查用户是否在线
     * @param userCode 用户编码
     */
    isUserOnline(userCode: string): boolean {
        return this.connections.has(userCode);
    }
}
