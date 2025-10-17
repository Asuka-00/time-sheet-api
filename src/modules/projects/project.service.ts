import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { ProjectDto } from './dto/project.dto';
import { ProjectVo } from './dto/project.vo';
import { ProjectMemberDto, BatchAddProjectMembersDto } from './dto/project-member.dto';
import { ProjectMemberVo } from './dto/project-member.vo';
import { BusinessException, ERROR_CODES } from '../../common';
import { UserService } from '../users/user.service';
import { RoleService } from '../roles/role.service';

@Injectable()
export class ProjectService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(ProjectMember)
        private readonly projectMemberRepository: Repository<ProjectMember>,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        @Inject(forwardRef(() => RoleService))
        private readonly roleService: RoleService,
    ) {}

    /**
     * 创建项目
     * @param projectDto 项目信息
     */
    async createProject(projectDto: ProjectDto): Promise<void> {
        // 判断项目编码是否存在
        const project = await this.projectRepository.findOneBy({
            projectCode: projectDto.projectCode,
        });
        if (project) {
            throw new BusinessException(ERROR_CODES.PROJECT.CREATE.CODE_ALREADY_EXISTS, 400);
        }

        // 验证项目经理是否存在
        const manager = await this.userService.findByUserCode(projectDto.managerUserCode);
        if (!manager) {
            throw new BusinessException(ERROR_CODES.PROJECT.CREATE.MANAGER_NOT_FOUND, 404);
        }

        // 保存项目
        await this.projectRepository.save(projectDto);
    }

    /**
     * 分页查询项目列表
     * @param current 当前页码
     * @param size 每页大小
     * @param searchKey 搜索关键字（可选）
     * @param userCode 当前用户编码（可选）
     * @returns 分页数据和总数
     */
    async getProjectList(
        current: number,
        size: number,
        searchKey?: string,
        userCode?: string,
    ): Promise<{ records: ProjectVo[]; total: number }> {
        // 如果没有用户编码，返回空列表
        if (!userCode) {
            return { records: [], total: 0 };
        }

        const user = await this.userService.findByUserCode(userCode);
        if (!user) {
            return { records: [], total: 0 };
        }

        // 获取用户所有角色的数据范围
        const allDataScopes: string[] = [];
        if (user.roleName) {
            // 用户可能有多个角色（逗号分隔），获取所有角色的 dataScope
            const roleNames = user.roleName
                .split(',')
                .map((r) => r.trim())
                .filter(Boolean);

            // 查询所有角色并收集 dataScope
            for (const roleName of roleNames) {
                const role = await this.roleService.getRoleByName(roleName);
                if (role?.dataScope) {
                    allDataScopes.push(role.dataScope);
                }
            }
        }

        // 计算跳过的记录数
        const skip = (current - 1) * size;

        // 构建查询
        const queryBuilder = this.projectRepository.createQueryBuilder('project');

        // 根据数据范围构建查询条件
        if (allDataScopes.length > 0) {
            // 角色有数据权限配置，优先使用角色数据权限
            // 合并所有角色的 dataScope
            const allScopeValues: string[] = [];
            let hasAllPermission = false;

            for (const dataScope of allDataScopes) {
                const scopeValues = dataScope
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);

                // 检查是否包含 ALL
                if (scopeValues.includes('ALL')) {
                    hasAllPermission = true;
                    break;
                }

                // 收集所有项目编号
                allScopeValues.push(...scopeValues);
            }

            if (hasAllPermission) {
                // 任意角色包含 ALL，不添加任何过滤条件，返回所有项目
                // queryBuilder 不需要 where 条件
            } else {
                // 合并所有角色的项目编号（去重）
                const uniqueProjectCodes = [...new Set(allScopeValues)];
                if (uniqueProjectCodes.length > 0) {
                    queryBuilder.where('project.projectCode IN (:...projectCodes)', {
                        projectCodes: uniqueProjectCodes,
                    });
                }
            }
        } else {
            // 角色无数据权限配置，使用默认权限：只能查看自己作为项目经理或项目总监的项目
            queryBuilder.where(
                '(project.managerUserCode = :userCode OR project.directorUserCode = :userCode)',
                { userCode },
            );
        }

        // 如果有搜索关键字，添加搜索条件
        if (searchKey) {
            queryBuilder.andWhere(
                '(project.projectCode LIKE :searchKey OR project.projectName LIKE :searchKey)',
                { searchKey: `%${searchKey}%` },
            );
        }

        // 执行分页查询
        const [records, total] = await queryBuilder
            .orderBy('project.createdAt', 'DESC')
            .skip(skip)
            .take(size)
            .getManyAndCount();

        // 填充额外信息
        const projectVos: ProjectVo[] = await Promise.all(
            records.map(async (project) => {
                const vo = { ...project } as ProjectVo;

                // 获取项目经理姓名
                const manager = await this.userService.findByUserCode(project.managerUserCode);
                vo.managerUserName = manager?.userName;

                // 获取项目总监姓名
                const director = await this.userService.findByUserCode(project.directorUserCode);
                vo.directorUserName = director?.userName;

                // 获取成员数量
                const memberCount = await this.projectMemberRepository.count({
                    where: { projectCode: project.projectCode },
                });
                vo.memberCount = memberCount;

                return vo;
            }),
        );

        return { records: projectVos, total };
    }

    /**
     * 查询项目
     * @param uuid 项目ID
     * @returns 项目信息
     */
    async getProject(uuid?: string): Promise<ProjectVo[]> {
        const projects = await this.projectRepository.find({ where: { uuid } });
        if (!projects || projects.length === 0) {
            return [];
        }

        // 填充额外信息
        const projectVos: ProjectVo[] = await Promise.all(
            projects.map(async (project) => {
                const vo = { ...project } as ProjectVo;

                // 获取项目经理姓名
                const manager = await this.userService.findByUserCode(project.managerUserCode);
                vo.managerUserName = manager?.userName;

                // 获取成员数量
                const memberCount = await this.projectMemberRepository.count({
                    where: { projectCode: project.projectCode },
                });
                vo.memberCount = memberCount;

                return vo;
            }),
        );

        return projectVos;
    }

    /**
     * 根据项目编号列表查询项目
     * @param projectCodes 项目编号列表
     * @returns 项目信息列表
     */
    async getProjectsByProjectCodes(projectCodes: string[]): Promise<ProjectVo[]> {
        if (!projectCodes || projectCodes.length === 0) {
            return [];
        }

        // 查询项目详情
        const projects = await this.projectRepository
            .createQueryBuilder('project')
            .where('project.projectCode IN (:...projectCodes)', { projectCodes })
            .orderBy('project.createdAt', 'DESC')
            .getMany();

        if (!projects || projects.length === 0) {
            return [];
        }

        // 填充额外信息
        const projectVos: ProjectVo[] = await Promise.all(
            projects.map(async (project) => {
                const vo = { ...project } as ProjectVo;

                // 获取项目经理姓名
                const manager = await this.userService.findByUserCode(project.managerUserCode);
                vo.managerUserName = manager?.userName;

                // 获取项目总监姓名
                const director = await this.userService.findByUserCode(project.directorUserCode);
                vo.directorUserName = director?.userName;

                // 获取成员数量
                const memberCount = await this.projectMemberRepository.count({
                    where: { projectCode: project.projectCode },
                });
                vo.memberCount = memberCount;

                return vo;
            }),
        );

        return projectVos;
    }

    /**
     * 更新项目
     * @param projectDto 项目信息
     */
    async updateProject(projectDto: ProjectDto): Promise<void> {
        if (!projectDto.uuid) {
            throw new BusinessException(ERROR_CODES.PROJECT.COMMON.ID_REQUIRED, 400);
        }

        // 验证项目经理是否存在
        const manager = await this.userService.findByUserCode(projectDto.managerUserCode);
        if (!manager) {
            throw new BusinessException(ERROR_CODES.PROJECT.UPDATE.MANAGER_NOT_FOUND, 404);
        }

        await this.projectRepository.update(projectDto.uuid, projectDto);
    }

    /**
     * 删除项目
     * @param uuid 项目ID
     */
    async deleteProject(uuid: string): Promise<void> {
        // 先删除项目成员
        await this.projectMemberRepository.delete({ projectCode: uuid });

        // 再删除项目
        await this.projectRepository.delete(uuid);
    }

    /**
     * 添加项目成员
     * @param memberDto 项目成员信息
     */
    async addProjectMember(memberDto: ProjectMemberDto): Promise<void> {
        // 验证项目是否存在
        const project = await this.projectRepository.findOneBy({
            projectCode: memberDto.projectCode,
        });
        if (!project) {
            throw new BusinessException(ERROR_CODES.PROJECT.COMMON.NOT_FOUND, 404);
        }

        // 验证用户是否存在
        const user = await this.userService.findByUserCode(memberDto.userCode);
        if (!user) {
            throw new BusinessException(ERROR_CODES.PROJECT.MEMBER.USER_NOT_FOUND, 404);
        }

        // 验证成员是否已存在
        const existingMember = await this.projectMemberRepository.findOneBy({
            projectCode: memberDto.projectCode,
            userCode: memberDto.userCode,
        });
        if (existingMember) {
            throw new BusinessException(ERROR_CODES.PROJECT.MEMBER.ALREADY_EXISTS, 400);
        }

        // 保存项目成员
        await this.projectMemberRepository.save(memberDto);
    }

    /**
     * 批量添加项目成员
     * @param batchDto 批量添加项目成员信息
     * @returns 添加结果统计
     */
    async batchAddProjectMembers(batchDto: BatchAddProjectMembersDto): Promise<{
        successCount: number;
        failedCount: number;
        failures: Array<{ userCode: string; reason: string }>;
    }> {
        // 验证项目是否存在
        const project = await this.projectRepository.findOneBy({
            projectCode: batchDto.projectCode,
        });
        if (!project) {
            throw new BusinessException(ERROR_CODES.PROJECT.COMMON.NOT_FOUND, 404);
        }

        let successCount = 0;
        let failedCount = 0;
        const failures: Array<{ userCode: string; reason: string }> = [];

        // 遍历用户编码列表，逐个添加
        for (const userCode of batchDto.userCodes) {
            try {
                // 验证用户是否存在
                const user = await this.userService.findByUserCode(userCode);
                if (!user) {
                    failures.push({
                        userCode,
                        reason: '用户不存在',
                    });
                    failedCount++;
                    continue;
                }

                // 验证成员是否已存在
                const existingMember = await this.projectMemberRepository.findOneBy({
                    projectCode: batchDto.projectCode,
                    userCode: userCode,
                });
                if (existingMember) {
                    failures.push({
                        userCode,
                        reason: '该用户已是项目成员',
                    });
                    failedCount++;
                    continue;
                }

                // 创建项目成员实体
                const memberDto: ProjectMemberDto = {
                    projectCode: batchDto.projectCode,
                    userCode: userCode,
                    role: batchDto.role,
                    joinDate: batchDto.joinDate,
                };

                // 保存项目成员
                await this.projectMemberRepository.save(memberDto);
                successCount++;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : '添加失败';
                failures.push({
                    userCode,
                    reason: errorMessage,
                });
                failedCount++;
            }
        }

        return {
            successCount,
            failedCount,
            failures,
        };
    }

    /**
     * 移除项目成员
     * @param uuid 项目成员ID
     */
    async removeProjectMember(uuid: string): Promise<void> {
        await this.projectMemberRepository.delete(uuid);
    }

    /**
     * 查询项目成员列表
     * @param projectCode 项目编码
     * @returns 项目成员列表
     */
    async getProjectMembers(projectCode: string): Promise<ProjectMemberVo[]> {
        const members = await this.projectMemberRepository.find({
            where: { projectCode },
            order: { joinDate: 'ASC' },
        });

        // 填充用户信息
        const memberVos: ProjectMemberVo[] = await Promise.all(
            members.map(async (member) => {
                const vo = { ...member } as ProjectMemberVo;

                // 获取用户信息
                const user = await this.userService.findByUserCode(member.userCode);
                if (user) {
                    vo.userName = user.userName;
                    vo.email = user.email;
                }

                return vo;
            }),
        );

        return memberVos;
    }

    /**
     * 查询用户参与的所有项目
     * @param userCode 用户编码
     * @returns 项目列表
     */
    async getUserProjects(userCode: string): Promise<ProjectVo[]> {
        // 查询用户参与的项目成员记录
        const memberRecords = await this.projectMemberRepository.find({
            where: { userCode },
        });

        // 获取项目编码列表
        const projectCodes = memberRecords.map((m) => m.projectCode);

        if (projectCodes.length === 0) {
            return [];
        }

        // 查询项目详情
        const projects = await this.projectRepository
            .createQueryBuilder('project')
            .where('project.projectCode IN (:...projectCodes)', { projectCodes })
            .orWhere('project.managerUserCode = :userCode', { userCode })
            .orderBy('project.createdAt', 'DESC')
            .getMany();

        // 填充额外信息
        const projectVos: ProjectVo[] = await Promise.all(
            projects.map(async (project) => {
                const vo = { ...project } as ProjectVo;

                // 获取项目经理姓名
                const manager = await this.userService.findByUserCode(project.managerUserCode);
                vo.managerUserName = manager?.userName;

                // 获取成员数量
                const memberCount = await this.projectMemberRepository.count({
                    where: { projectCode: project.projectCode },
                });
                vo.memberCount = memberCount;

                return vo;
            }),
        );

        return projectVos;
    }
}
