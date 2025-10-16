import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserVo } from './dto/user.vo';
import { BusinessException, ERROR_CODES } from '../../common';
import { RoleService } from '../roles/role.service';
import { WebSocketService } from '../websocket/websocket.service';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @Inject(forwardRef(() => RoleService))
        private readonly roleService: RoleService,
        @Inject(forwardRef(() => WebSocketService))
        private readonly websocketService: WebSocketService,
    ) {}

    /**
     * 创建用户
     * @param createUserDto 用户信息
     */
    async createUser(createUserDto: CreateUserDto): Promise<void> {
        // 判断用户是否存在
        const user = await this.userRepository.findOneBy({ userCode: createUserDto.userCode });
        if (user) {
            throw new BusinessException(ERROR_CODES.USER.CREATE.ALREADY_EXISTS, 400);
        }

        // 加密密码
        const hashedPassword = await this.hashPassword(createUserDto.password);

        // 保存用户（使用加密后的密码，设置默认值）
        await this.userRepository.save({
            userCode: createUserDto.userCode,
            userName: createUserDto.userName,
            password: hashedPassword,
            email: createUserDto.email ?? null,
            phoneNumber: createUserDto.phoneNumber ?? null,
            roleName: createUserDto.roleName ?? null,
            departmentName: createUserDto.departmentName ?? null,
            timezone: createUserDto.timezone ?? null,
            status: createUserDto.status ?? 1,
        } as User);
        return;
    }

    /**
     * 分页查询用户列表
     * @param current 当前页码
     * @param size 每页大小
     * @param searchKey 搜索关键字（可选）
     * @returns 分页数据和总数
     */
    async getUserList(
        current: number,
        size: number,
        searchKey?: string,
    ): Promise<{ records: UserVo[]; total: number }> {
        // 计算跳过的记录数
        const skip = (current - 1) * size;

        // 构建查询条件
        let where: FindOptionsWhere<User> | FindOptionsWhere<User>[] = {};
        if (searchKey) {
            where = [{ userCode: Like(`%${searchKey}%`) }, { userName: Like(`%${searchKey}%`) }];
        }

        // 执行分页查询
        const [records, total] = await this.userRepository.findAndCount({
            where,
            skip,
            take: size,
            order: {
                createdAt: 'DESC', // 按创建时间倒序
            },
        });

        return { records, total };
    }

    /**
     * 删除用户
     * @param uuid 用户ID
     */
    async deleteUser(uuid: string): Promise<void> {
        await this.userRepository.delete(uuid);
        return;
    }

    /**
     * 更新用户
     * @param updateUserDto 用户信息
     */
    async updateUser(updateUserDto: UpdateUserDto): Promise<void> {
        if (!updateUserDto.uuid) {
            throw new BusinessException(ERROR_CODES.USER.COMMON.ID_REQUIRED, 400);
        }
        // 排除 uuid 字段，不允许修改主键
        const { uuid, ...updateData } = updateUserDto;
        await this.userRepository.update(uuid, updateData);

        // 如果修改了角色，推送新权限给该用户
        if (updateUserDto.roleName !== undefined) {
            const user = await this.userRepository.findOne({ where: { uuid } });
            if (user) {
                this.websocketService.pushPermissions(user.userCode).catch((err: Error) => {
                    // 静默失败，不影响主流程
                    this.logger.error(`推送权限给用户 ${user.userCode} 失败: ${err.message}`);
                });
            }
        }

        return;
    }

    /**
     * 查询用户
     * @param uuid 用户ID
     * @returns 用户信息
     */
    async getUser(uuid?: string): Promise<UserVo[]> {
        const user = await this.userRepository.find({ where: { uuid } });
        if (!user) {
            throw new BusinessException(ERROR_CODES.USER.COMMON.NOT_FOUND, 404);
        }
        return user;
    }

    /**
     * 通过邮箱查找用户
     * @param email 邮箱
     * @returns 用户信息
     */
    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { email } });
    }

    /**
     * 通过用户编码查找用户
     * @param userCode 用户编码
     * @returns 用户信息
     */
    async findByUserCode(userCode: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { userCode } });
    }

    /**
     * 通过用户编码批量查找用户
     * @param userCodes 用户编码数组
     * @returns 用户信息数组
     */
    async findByUserCodes(userCodes: string[]): Promise<User[]> {
        if (!userCodes || userCodes.length === 0) {
            return [];
        }
        return await this.userRepository
            .createQueryBuilder('user')
            .where('user.userCode IN (:...userCodes)', { userCodes })
            .getMany();
    }

    /**
     * 通过UUID查找用户
     * @param uuid 用户UUID
     * @returns 用户信息
     */
    async findByUuid(uuid: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { uuid } });
    }

    /**
     * 获取用户的所有角色（解析逗号分割）
     * @param user 用户实体
     * @returns 角色名称数组
     */
    getUserRoles(user: User): string[] {
        if (!user.roleName) {
            return [];
        }
        return user.roleName
            .split(',')
            .map((r) => r.trim())
            .filter(Boolean);
    }

    /**
     * 获取用户的所有部门（解析逗号分割）
     * @param user 用户实体
     * @returns 部门名称数组
     */
    getUserDepartments(user: User): string[] {
        if (!user.departmentName) {
            return [];
        }
        return user.departmentName
            .split(',')
            .map((d) => d.trim())
            .filter(Boolean);
    }

    /**
     * 获取用户的所有权限（通过角色聚合）
     * @param user 用户实体或用户编码
     * @returns 权限代码数组（去重）
     */
    async getUserAllPermissions(user: User | string): Promise<string[]> {
        // 支持传入User实体或userCode
        let targetUser: User | null;
        if (typeof user === 'string') {
            targetUser = await this.findByUserCode(user);
            if (!targetUser) {
                return [];
            }
        } else {
            targetUser = user;
        }

        const roles = this.getUserRoles(targetUser);
        if (roles.length === 0) {
            return [];
        }

        // 聚合所有角色的权限
        const allPermissions: string[] = [];
        for (const roleName of roles) {
            const permissions = await this.roleService.getPermissionsByRoleName(roleName);
            allPermissions.push(...permissions);
        }

        // 去重并返回
        return [...new Set(allPermissions)];
    }

    /**
     * 验证用户密码
     * @param userCode 用户编码
     * @param password 明文密码
     * @returns 验证通过返回用户信息，否则返回null
     */
    async validateUserPassword(userCode: string, password: string): Promise<User | null> {
        const user = await this.findByUserCode(userCode);
        if (!user) {
            return null;
        }

        // 验证密码
        const isPasswordValid = await argon2.verify(user.password, password);
        if (!isPasswordValid) {
            return null;
        }

        return user;
    }

    /**
     * 密码加密
     * @param password 明文密码
     * @returns 加密后的密码
     */
    async hashPassword(password: string): Promise<string> {
        return await argon2.hash(password);
    }

    /**
     * 重置用户密码
     * @param uuid 用户ID
     * @param newPassword 新密码（明文）
     */
    async resetPassword(uuid: string, newPassword: string): Promise<void> {
        // 验证用户是否存在
        const user = await this.findByUuid(uuid);
        if (!user) {
            throw new BusinessException(ERROR_CODES.USER.COMMON.NOT_FOUND, 404);
        }

        // 加密新密码
        const hashedPassword = await this.hashPassword(newPassword);

        // 更新密码
        await this.userRepository.update(uuid, { password: hashedPassword });
        return;
    }

    /**
     * 修改用户密码
     * @param userCode 用户编码
     * @param oldPassword 旧密码（明文）
     * @param newPassword 新密码（明文）
     */
    async changePassword(
        userCode: string,
        oldPassword: string,
        newPassword: string,
    ): Promise<void> {
        // 查找用户
        const user = await this.findByUserCode(userCode);
        if (!user) {
            throw new BusinessException(ERROR_CODES.USER.COMMON.NOT_FOUND, 404);
        }

        // 验证旧密码
        const isPasswordValid = await argon2.verify(user.password, oldPassword);
        if (!isPasswordValid) {
            throw new BusinessException(ERROR_CODES.USER.PASSWORD.OLD_PASSWORD_INCORRECT, 400);
        }

        // 检查新密码与旧密码是否相同
        const isSamePassword = await argon2.verify(user.password, newPassword);
        if (isSamePassword) {
            throw new BusinessException(ERROR_CODES.USER.PASSWORD.SAME_AS_OLD, 400);
        }

        // 加密新密码
        const hashedPassword = await this.hashPassword(newPassword);

        // 更新密码
        await this.userRepository.update(user.uuid, { password: hashedPassword });
        return;
    }
}
