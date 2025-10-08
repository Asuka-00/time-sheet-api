import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionDto } from './dto/permission.dto';
import { PermissionVo } from './dto/permission.vo';
import { BusinessException, ERROR_CODES } from '../../common';

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>,
    ) {}

    /**
     * 新增权限
     * @param permissionDto
     */
    async createPermission(permissionDto: PermissionDto): Promise<void> {
        const duplicatePermission = await this.permissionRepository.findOneBy({
            code: permissionDto.code,
        });
        if (duplicatePermission) {
            throw new BusinessException(ERROR_CODES.PERMISSION.CREATE.CODE_ALREADY_EXISTS, 400);
        }
        const permission = this.permissionRepository.create(permissionDto);
        await this.permissionRepository.save(permission);
    }

    /**
     * 分页查询权限列表
     * @param current 当前页
     * @param size 每页大小
     * @param searchKey 搜索关键字
     * @returns 分页权限列表
     */
    async getPermissionList(
        current: number,
        size: number,
        searchKey?: string,
    ): Promise<{ records: PermissionVo[]; total: number }> {
        // 构建查询条件
        let where: FindOptionsWhere<Permission> | FindOptionsWhere<Permission>[] = {};
        if (searchKey) {
            // 支持按权限名称、代码模糊搜索
            where = [{ name: Like(`%${searchKey}%`) }, { code: Like(`%${searchKey}%`) }];
        }

        const [records, total] = await this.permissionRepository.findAndCount({
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
     * 删除权限
     * @param uuid 权限ID
     */
    async deletePermission(uuid: string): Promise<void> {
        await this.permissionRepository.delete(uuid);
        return;
    }

    /**
     * 更新权限
     * @param permissionDto 权限信息
     */
    async updatePermission(permissionDto: PermissionDto): Promise<void> {
        if (!permissionDto.uuid) {
            throw new BusinessException(ERROR_CODES.PERMISSION.COMMON.ID_REQUIRED, 400);
        }
        await this.permissionRepository.update(permissionDto.uuid, permissionDto);
        return;
    }

    /**
     * 查询权限
     * @param uuid 权限ID
     * @returns 权限信息
     */
    async getPermission(uuid?: string): Promise<PermissionVo[]> {
        const permission = await this.permissionRepository.find({ where: { uuid } });
        if (!permission) {
            throw new BusinessException(ERROR_CODES.PERMISSION.COMMON.NOT_FOUND, 404);
        }
        return permission;
    }

    /**
     * 递归构建树形结构
     * @param permissions 所有权限列表
     * @param parentCode 父级代码
     * @returns 树形权限数组
     */
    private buildTree(permissions: Permission[], parentCode: string | null): PermissionVo[] {
        const result: PermissionVo[] = [];

        // 筛选出当前层级的权限
        const currentLevelPermissions = permissions.filter((p) => {
            if (parentCode === null) {
                return !p.parentCode || p.parentCode === '';
            }
            return p.parentCode === parentCode;
        });

        // 递归构建子节点
        for (const permission of currentLevelPermissions) {
            const node: PermissionVo = {
                ...permission,
                children: this.buildTree(permissions, permission.code),
            };

            // 如果没有子节点，删除children属性以减少数据量
            if (node.children && node.children.length === 0) {
                delete node.children;
            }

            result.push(node);
        }

        return result;
    }

    /**
     * 获取树形权限列表
     * @returns 树形权限列表
     */
    async getPermissionTree(): Promise<PermissionVo[]> {
        // 1. 查询所有权限，按sort排序
        const allPermissions = await this.permissionRepository.find({
            order: {
                sort: 'ASC',
                createdAt: 'ASC',
            },
        });

        // 2. 构建树形结构
        return this.buildTree(allPermissions, null);
    }

    /**
     * 获取特定权限的子树
     * @param parentCode 父级权限代码
     * @returns 子树权限列表
     */
    async getPermissionSubTree(parentCode: string): Promise<PermissionVo[]> {
        const allPermissions = await this.permissionRepository.find({
            order: {
                sort: 'ASC',
                createdAt: 'ASC',
            },
        });

        return this.buildTree(allPermissions, parentCode);
    }

    /**
     * 获取用户权限菜单树（根据用户权限代码过滤）
     * @param permissionCodes 用户拥有的权限代码数组
     * @returns 过滤后的权限树（仅包含用户有权限的菜单项）
     */
    async getUserPermissionTree(permissionCodes: string[]): Promise<PermissionVo[]> {
        // 1. 查询所有启用的菜单类型权限
        const allPermissions = await this.permissionRepository.find({
            where: {
                status: 1,
                type: 'menu',
            },
            order: {
                sort: 'ASC',
                createdAt: 'ASC',
            },
        });

        // 2. 过滤出用户有权限的菜单项
        const userPermissions = allPermissions.filter((p) => permissionCodes.includes(p.code));

        // 3. 收集所有需要的父节点（即使用户没有父节点权限，但有子节点权限时也需要显示父节点）
        const permissionSet = new Set<string>();
        userPermissions.forEach((p) => {
            permissionSet.add(p.code);
            // 递归添加所有父节点
            this.addParentCodes(p.parentCode, allPermissions, permissionSet);
        });

        // 4. 根据收集的权限代码过滤权限列表
        const filteredPermissions = allPermissions.filter((p) => permissionSet.has(p.code));

        // 5. 构建树形结构
        return this.buildTree(filteredPermissions, null);
    }

    /**
     * 递归添加父节点代码到集合中
     * @param parentCode 父节点代码
     * @param allPermissions 所有权限列表
     * @param permissionSet 权限代码集合
     */
    private addParentCodes(
        parentCode: string | undefined,
        allPermissions: Permission[],
        permissionSet: Set<string>,
    ): void {
        if (!parentCode) {
            return;
        }

        const parent = allPermissions.find((p) => p.code === parentCode);
        if (parent && !permissionSet.has(parent.code)) {
            permissionSet.add(parent.code);
            // 递归添加父节点的父节点
            this.addParentCodes(parent.parentCode, allPermissions, permissionSet);
        }
    }
}
