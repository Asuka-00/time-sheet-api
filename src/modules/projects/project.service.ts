import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { ProjectDto } from './dto/project.dto';
import { ProjectVo } from './dto/project.vo';
import { ProjectMemberDto } from './dto/project-member.dto';
import { ProjectMemberVo } from './dto/project-member.vo';
import { BusinessException, ERROR_CODES } from '../../common';
import { UserService } from '../users/user.service';

@Injectable()
export class ProjectService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(ProjectMember)
        private readonly projectMemberRepository: Repository<ProjectMember>,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
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
     * @returns 分页数据和总数
     */
    async getProjectList(
        current: number,
        size: number,
        searchKey?: string,
    ): Promise<{ records: ProjectVo[]; total: number }> {
        // 计算跳过的记录数
        const skip = (current - 1) * size;

        // 构建查询条件
        let where: FindOptionsWhere<Project> | FindOptionsWhere<Project>[] = {};
        if (searchKey) {
            where = [
                { projectCode: Like(`%${searchKey}%`) },
                { projectName: Like(`%${searchKey}%`) },
            ];
        }

        // 执行分页查询
        const [records, total] = await this.projectRepository.findAndCount({
            where,
            skip,
            take: size,
            order: {
                createdAt: 'DESC',
            },
        });

        // 填充额外信息
        const projectVos: ProjectVo[] = await Promise.all(
            records.map(async (project) => {
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
            throw new BusinessException(ERROR_CODES.PROJECT.COMMON.NOT_FOUND, 404);
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
