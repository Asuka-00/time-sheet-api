import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { RoleDto } from './dto/role.dto';
import { RoleVo } from './dto/role.vo';
import { BusinessException, ERROR_CODES } from '../../common';

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(RolePermission)
        private readonly rolePermissionRepository: Repository<RolePermission>,
    ) {}

    /**
     * 新增角色
     * @param roleDto
     */
    @Transactional()
    async createRole(roleDto: RoleDto): Promise<void> {
        const duplicateRole = await this.roleRepository.findOneBy({ name: roleDto.name });
        if (duplicateRole) {
            throw new BusinessException(ERROR_CODES.ROLE.CREATE.ALREADY_EXISTS, 400);
        }

        const role = this.roleRepository.create(roleDto);
        await this.roleRepository.save(role);

        // 如果提供了权限代码，则分配权限
        if (roleDto.permissionCodes && roleDto.permissionCodes.length > 0) {
            const rolePermissions = roleDto.permissionCodes.map((code) =>
                this.rolePermissionRepository.create({
                    roleName: roleDto.name,
                    permissionCode: code,
                }),
            );
            await this.rolePermissionRepository.save(rolePermissions);
        }
    }

    /**
     * 分页查询角色列表
     * @param current 当前页
     * @param size 每页大小
     * @param searchKey 搜索关键字
     * @returns 分页角色列表
     */
    async getRoleList(
        current: number,
        size: number,
        searchKey?: string,
    ): Promise<{ records: RoleVo[]; total: number }> {
        // 构建查询条件
        let where: FindOptionsWhere<Role> | FindOptionsWhere<Role>[] = {};
        if (searchKey) {
            // 支持按邮箱、姓名模糊搜索
            where = [{ name: Like(`%${searchKey}%`) }];
        }

        const [records, total] = await this.roleRepository.findAndCount({
            where,
            take: size,
            skip: (current - 1) * size,
            order: {
                createdAt: 'DESC', // 按创建时间倒序
            },
        });
        return { records, total };
    }

    /**
     * 删除角色
     * @param uuid 角色ID
     */
    @Transactional()
    async deleteRole(uuid: string): Promise<void> {
        // 先查询角色获取roleName
        const role = await this.roleRepository.findOne({ where: { uuid } });
        if (role) {
            // 级联删除该角色的所有权限关联
            await this.rolePermissionRepository.delete({ roleName: role.name });
        }
        // 删除角色
        await this.roleRepository.delete(uuid);
    }

    /**
     * 更新角色
     * @param roleDto 角色信息
     */
    @Transactional()
    async updateRole(roleDto: RoleDto): Promise<void> {
        const { uuid, permissionCodes, ...roleData } = roleDto;

        if (!uuid) {
            throw new BusinessException(ERROR_CODES.ROLE.COMMON.ID_REQUIRED, 400);
        }

        // 只更新Role实体字段（name, description等）
        await this.roleRepository.update(uuid, roleData);

        // 如果提供了权限代码，则更新权限分配
        if (permissionCodes !== undefined) {
            // 删除该角色的所有现有权限
            await this.rolePermissionRepository.delete({ roleName: roleData.name });

            // 批量插入新的权限关联
            if (permissionCodes.length > 0) {
                const rolePermissions = permissionCodes.map((code) =>
                    this.rolePermissionRepository.create({
                        roleName: roleData.name,
                        permissionCode: code,
                    }),
                );
                await this.rolePermissionRepository.save(rolePermissions);
            }
        }
    }

    /**
     * 查询角色
     * @param uuid 角色ID
     * @returns 角色信息
     */
    async getRole(uuid?: string): Promise<RoleVo[]> {
        const role = await this.roleRepository.find({ where: { uuid } });
        if (!role) {
            throw new BusinessException(ERROR_CODES.ROLE.COMMON.NOT_FOUND, 404);
        }
        return role;
    }

    /**
     * 查询指定角色的所有权限
     * @param roleName 角色名称
     * @returns 权限代码数组
     */
    async getPermissionsByRoleName(roleName: string): Promise<string[]> {
        const rolePermissions = await this.rolePermissionRepository.find({
            where: { roleName },
        });
        return rolePermissions.map((rp) => rp.permissionCode);
    }
}
