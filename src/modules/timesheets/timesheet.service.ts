import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere, In } from 'typeorm';
import { Timesheet } from './entities/timesheet.entity';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { UpdateTimesheetDto } from './dto/update-timesheet.dto';
import { ReviewTimesheetDto } from './dto/review-timesheet.dto';
import { TimesheetVo } from './dto/timesheet.vo';
import { TimesheetQueryDto } from './dto/timesheet-query.dto';
import { TimesheetStatisticsDto } from './dto/timesheet-statistics.dto';
import { BusinessException, ERROR_CODES } from '../../common';
import { ProjectService } from '../projects/project.service';
import { UserService } from '../users/user.service';
import { RequestContextService } from '../../common/context/request-context.service';

@Injectable()
export class TimesheetService {
    constructor(
        @InjectRepository(Timesheet)
        private readonly timesheetRepository: Repository<Timesheet>,
        @Inject(forwardRef(() => ProjectService))
        private readonly projectService: ProjectService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
    ) {}

    /**
     * 创建工时记录
     */
    async createTimesheet(dto: CreateTimesheetDto): Promise<void> {
        const currentUserCode = RequestContextService.getCurrentUserCode();
        if (!currentUserCode) {
            throw new BusinessException(ERROR_CODES.COMMON.UNAUTHORIZED, 401);
        }

        // 验证项目存在且状态为进行中
        const projects = await this.projectService.getProject();
        const project = projects.find((p) => p.projectCode === dto.projectCode);
        if (!project) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.CREATE.PROJECT_NOT_FOUND, 404);
        }
        if (project.status !== 1) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.CREATE.PROJECT_NOT_IN_PROGRESS, 400);
        }

        const projectCode = dto.projectCode;

        // 验证当前用户是项目成员
        const isMember = await this.isProjectMember(projectCode, currentUserCode);
        if (!isMember) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.CREATE.NOT_PROJECT_MEMBER, 403);
        }

        // 验证工作日期不能是未来
        const workDate = new Date(dto.workDate);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (workDate > today) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.CREATE.FUTURE_DATE_NOT_ALLOWED, 400);
        }

        // 验证同一天同一项目不能重复提交
        const existingTimesheet = await this.timesheetRepository.findOne({
            where: {
                userCode: currentUserCode,
                projectCode: projectCode,
                workDate: workDate,
                status: In([1, 2, 3]),
            },
        });
        if (existingTimesheet) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.CREATE.DUPLICATE_RECORD, 409);
        }

        // 生成工时编码
        const timesheetCode = await this.generateTimesheetCode();

        // 创建工时记录
        const timesheet = new Timesheet();
        timesheet.timesheetCode = timesheetCode;
        timesheet.userCode = currentUserCode;
        timesheet.projectCode = projectCode;
        timesheet.workDate = workDate;
        timesheet.hours = dto.hours;
        timesheet.description = dto.description;
        timesheet.status = 1; // 草稿状态

        await this.timesheetRepository.save(timesheet);
    }

    /**
     * 批量创建工时记录
     */
    async batchCreateTimesheets(dtos: CreateTimesheetDto[]): Promise<{
        successCount: number;
        failedCount: number;
        errors: Array<{ index: number; error: string }>;
    }> {
        let successCount = 0;
        let failedCount = 0;
        const errors: Array<{ index: number; error: string }> = [];

        for (let i = 0; i < dtos.length; i++) {
            try {
                await this.createTimesheet(dtos[i]);
                successCount++;
            } catch (error) {
                failedCount++;
                const errorMessage =
                    error instanceof BusinessException
                        ? error.message
                        : ERROR_CODES.TIMESHEET.CREATE.PROJECT_NOT_FOUND;
                errors.push({
                    index: i,
                    error: errorMessage,
                });
            }
        }

        return { successCount, failedCount, errors };
    }

    /**
     * 提交工时审核
     */
    async submitTimesheet(uuid: string): Promise<void> {
        const currentUserCode = RequestContextService.getCurrentUserCode();
        if (!currentUserCode) {
            throw new BusinessException(ERROR_CODES.COMMON.UNAUTHORIZED, 401);
        }

        const timesheet = await this.timesheetRepository.findOne({ where: { uuid } });
        if (!timesheet) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.COMMON.NOT_FOUND, 404);
        }

        if (timesheet.userCode !== currentUserCode) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.SUBMIT.NOT_OWNER, 403);
        }

        if (timesheet.status !== 1) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.SUBMIT.INVALID_STATUS, 400);
        }

        timesheet.status = 2; // 待审核
        timesheet.submitDate = new Date();
        await this.timesheetRepository.save(timesheet);
    }

    /**
     * 批量提交工时审核
     */
    async batchSubmitTimesheets(uuids: string[]): Promise<void> {
        for (const uuid of uuids) {
            await this.submitTimesheet(uuid);
        }
    }

    /**
     * 审核工时
     */
    async reviewTimesheet(dto: ReviewTimesheetDto): Promise<void> {
        const currentUserCode = RequestContextService.getCurrentUserCode();
        if (!currentUserCode) {
            throw new BusinessException(ERROR_CODES.COMMON.UNAUTHORIZED, 401);
        }

        const timesheet = await this.timesheetRepository.findOne({ where: { uuid: dto.uuid } });
        if (!timesheet) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.COMMON.NOT_FOUND, 404);
        }

        if (timesheet.status !== 2) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.REVIEW.INVALID_STATUS, 400);
        }

        // 验证审核人是项目经理
        const isManager = await this.isProjectManager(timesheet.projectCode, currentUserCode);
        if (!isManager) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.REVIEW.NO_PERMISSION, 403);
        }

        timesheet.status = dto.status;
        timesheet.reviewerUserCode = currentUserCode;
        timesheet.reviewDate = new Date();
        timesheet.reviewComment = dto.reviewComment ?? undefined;

        await this.timesheetRepository.save(timesheet);
    }

    /**
     * 批量审核工时
     */
    async batchReviewTimesheets(dtos: ReviewTimesheetDto[]): Promise<void> {
        for (const dto of dtos) {
            await this.reviewTimesheet(dto);
        }
    }

    /**
     * 更新工时记录（仅草稿状态可更新）
     */
    async updateTimesheet(dto: UpdateTimesheetDto): Promise<void> {
        const currentUserCode = RequestContextService.getCurrentUserCode();
        if (!currentUserCode) {
            throw new BusinessException(ERROR_CODES.COMMON.UNAUTHORIZED, 401);
        }

        const timesheet = await this.timesheetRepository.findOne({ where: { uuid: dto.uuid } });
        if (!timesheet) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.COMMON.NOT_FOUND, 404);
        }

        if (timesheet.userCode !== currentUserCode) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.UPDATE.NOT_OWNER, 403);
        }

        if (timesheet.status !== 1) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.UPDATE.INVALID_STATUS, 400);
        }

        // 更新字段
        if (dto.projectCode) {
            // 验证项目存在且状态为进行中
            const projects = await this.projectService.getProject();
            const project = projects.find((p) => p.projectCode === dto.projectCode);
            if (!project) {
                throw new BusinessException(ERROR_CODES.TIMESHEET.UPDATE.PROJECT_NOT_FOUND, 404);
            }
            if (project.status !== 1) {
                throw new BusinessException(
                    ERROR_CODES.TIMESHEET.UPDATE.PROJECT_NOT_IN_PROGRESS,
                    400,
                );
            }

            // 验证当前用户是项目成员
            const isMember = await this.isProjectMember(dto.projectCode, currentUserCode);
            if (!isMember) {
                throw new BusinessException(ERROR_CODES.TIMESHEET.UPDATE.NOT_PROJECT_MEMBER, 403);
            }

            timesheet.projectCode = dto.projectCode;
        }

        if (dto.workDate) {
            const workDate = new Date(dto.workDate);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            if (workDate > today) {
                throw new BusinessException(
                    ERROR_CODES.TIMESHEET.UPDATE.FUTURE_DATE_NOT_ALLOWED,
                    400,
                );
            }
            timesheet.workDate = workDate;
        }

        if (dto.hours !== undefined) {
            timesheet.hours = dto.hours;
        }

        if (dto.description !== undefined) {
            timesheet.description = dto.description;
        }

        await this.timesheetRepository.save(timesheet);
    }

    /**
     * 删除工时记录（仅草稿状态可删除）
     */
    async deleteTimesheet(uuid: string): Promise<void> {
        const currentUserCode = RequestContextService.getCurrentUserCode();
        if (!currentUserCode) {
            throw new BusinessException(ERROR_CODES.COMMON.UNAUTHORIZED, 401);
        }

        const timesheet = await this.timesheetRepository.findOne({ where: { uuid } });
        if (!timesheet) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.COMMON.NOT_FOUND, 404);
        }

        if (timesheet.userCode !== currentUserCode) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.DELETE.NOT_OWNER, 403);
        }

        if (timesheet.status !== 1) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.DELETE.INVALID_STATUS, 400);
        }

        await this.timesheetRepository.delete(uuid);
    }

    /**
     * 撤回工时审核（将待审核改回草稿）
     */
    async withdrawTimesheet(uuid: string): Promise<void> {
        const currentUserCode = RequestContextService.getCurrentUserCode();
        if (!currentUserCode) {
            throw new BusinessException(ERROR_CODES.COMMON.UNAUTHORIZED, 401);
        }

        const timesheet = await this.timesheetRepository.findOne({ where: { uuid } });
        if (!timesheet) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.COMMON.NOT_FOUND, 404);
        }

        if (timesheet.userCode !== currentUserCode) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.RECALL.NOT_OWNER, 403);
        }

        if (timesheet.status !== 2) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.RECALL.INVALID_STATUS, 400);
        }

        timesheet.status = 1; // 改回草稿
        // @ts-expect-error - SQLite allows null for nullable datetime fields
        timesheet.submitDate = null;
        await this.timesheetRepository.save(timesheet);
    }

    /**
     * 分页查询工时列表
     */
    async getTimesheetList(
        query: TimesheetQueryDto,
    ): Promise<{ records: TimesheetVo[]; total: number }> {
        const current = query.current || 1;
        const size = query.size || 10;
        const skip = (current - 1) * size;

        // 构建查询条件
        const where: FindOptionsWhere<Timesheet> = {};

        if (query.userCode) {
            where.userCode = query.userCode;
        }

        if (query.projectCode) {
            where.projectCode = query.projectCode;
        }

        if (query.status) {
            where.status = query.status;
        }

        if (query.startDate && query.endDate) {
            where.workDate = Between(new Date(query.startDate), new Date(query.endDate));
        } else if (query.startDate) {
            where.workDate = Between(new Date(query.startDate), new Date('2099-12-31'));
        } else if (query.endDate) {
            where.workDate = Between(new Date('1900-01-01'), new Date(query.endDate));
        }

        // 执行分页查询
        const [records, total] = await this.timesheetRepository.findAndCount({
            where,
            skip,
            take: size,
            order: {
                workDate: 'DESC',
                createdAt: 'DESC',
            },
        });

        // 填充额外信息
        const timesheetVos = await this.buildTimesheetVos(records);

        return { records: timesheetVos, total };
    }

    /**
     * 查询我的工时
     */
    async getMyTimesheets(
        query: TimesheetQueryDto,
    ): Promise<{ records: TimesheetVo[]; total: number }> {
        const currentUserCode = RequestContextService.getCurrentUserCode();
        if (!currentUserCode) {
            throw new BusinessException(ERROR_CODES.COMMON.UNAUTHORIZED, 401);
        }

        query.userCode = currentUserCode;
        return this.getTimesheetList(query);
    }

    /**
     * 查询待我审核的工时
     */
    async getPendingReviewTimesheets(
        query: TimesheetQueryDto,
    ): Promise<{ records: TimesheetVo[]; total: number }> {
        const currentUserCode = RequestContextService.getCurrentUserCode();
        if (!currentUserCode) {
            throw new BusinessException(ERROR_CODES.COMMON.UNAUTHORIZED, 401);
        }

        // 查询当前用户作为项目经理的项目
        const allProjects = await this.projectService.getProject();
        const managedProjects = allProjects.filter((p) => p.managerUserCode === currentUserCode);
        const projectCodes = managedProjects.map((p) => p.projectCode);

        if (projectCodes.length === 0) {
            return { records: [], total: 0 };
        }

        const current = query.current || 1;
        const size = query.size || 10;
        const skip = (current - 1) * size;

        // 查询这些项目的待审核工时
        const queryBuilder = this.timesheetRepository
            .createQueryBuilder('timesheet')
            .where('timesheet.projectCode IN (:...projectCodes)', { projectCodes })
            .andWhere('timesheet.status = :status', { status: 2 });

        if (query.startDate && query.endDate) {
            queryBuilder.andWhere('timesheet.workDate BETWEEN :startDate AND :endDate', {
                startDate: query.startDate,
                endDate: query.endDate,
            });
        }

        const [records, total] = await queryBuilder
            .skip(skip)
            .take(size)
            .orderBy('timesheet.submitDate', 'ASC')
            .getManyAndCount();

        const timesheetVos = await this.buildTimesheetVos(records);

        return { records: timesheetVos, total };
    }

    /**
     * 查询项目经理管理的工时
     */
    async getProjectManagerTimesheets(
        query: TimesheetQueryDto,
    ): Promise<{ records: TimesheetVo[]; total: number }> {
        const currentUserCode = RequestContextService.getCurrentUserCode();
        if (!currentUserCode) {
            throw new BusinessException(ERROR_CODES.COMMON.UNAUTHORIZED, 401);
        }

        // 查询当前用户作为项目经理的项目
        const allProjects = await this.projectService.getProject();
        const managedProjects = allProjects.filter((p) => p.managerUserCode === currentUserCode);
        const projectCodes = managedProjects.map((p) => p.projectCode);

        if (projectCodes.length === 0) {
            return { records: [], total: 0 };
        }

        const current = query.current || 1;
        const size = query.size || 10;
        const skip = (current - 1) * size;

        // 查询这些项目的工时
        const queryBuilder = this.timesheetRepository
            .createQueryBuilder('timesheet')
            .where('timesheet.projectCode IN (:...projectCodes)', { projectCodes });

        // 应用筛选条件
        if (query.userCode) {
            queryBuilder.andWhere('timesheet.userCode = :userCode', { userCode: query.userCode });
        }

        if (query.projectCode) {
            queryBuilder.andWhere('timesheet.projectCode = :projectCode', {
                projectCode: query.projectCode,
            });
        }

        if (query.status) {
            queryBuilder.andWhere('timesheet.status = :status', { status: query.status });
        }

        if (query.startDate && query.endDate) {
            queryBuilder.andWhere('timesheet.workDate BETWEEN :startDate AND :endDate', {
                startDate: query.startDate,
                endDate: query.endDate,
            });
        } else if (query.startDate) {
            queryBuilder.andWhere('timesheet.workDate >= :startDate', {
                startDate: query.startDate,
            });
        } else if (query.endDate) {
            queryBuilder.andWhere('timesheet.workDate <= :endDate', { endDate: query.endDate });
        }

        const [records, total] = await queryBuilder
            .skip(skip)
            .take(size)
            .orderBy('timesheet.workDate', 'DESC')
            .addOrderBy('timesheet.createdAt', 'DESC')
            .getManyAndCount();

        const timesheetVos = await this.buildTimesheetVos(records);

        return { records: timesheetVos, total };
    }

    /**
     * 查询工时详情
     */
    async getTimesheetDetail(uuid: string): Promise<TimesheetVo> {
        const timesheet = await this.timesheetRepository.findOne({ where: { uuid } });
        if (!timesheet) {
            throw new BusinessException(ERROR_CODES.TIMESHEET.COMMON.NOT_FOUND, 404);
        }

        const timesheetVos = await this.buildTimesheetVos([timesheet]);
        return timesheetVos[0];
    }

    /**
     * 工时统计
     */
    async getTimesheetStatistics(
        userCode?: string,
        projectCode?: string,
        startDate?: string,
        endDate?: string,
    ): Promise<TimesheetStatisticsDto> {
        const where: FindOptionsWhere<Timesheet> = {};

        if (userCode) {
            where.userCode = userCode;
        }

        if (projectCode) {
            where.projectCode = projectCode;
        }

        if (startDate && endDate) {
            where.workDate = Between(new Date(startDate), new Date(endDate));
        }

        // 只统计已通过的工时
        where.status = 3;

        const timesheets = await this.timesheetRepository.find({ where });

        // 总工时
        const totalHours = timesheets.reduce((sum, t) => sum + t.hours, 0);

        // 按项目统计
        const projectStats = {};
        timesheets.forEach((t) => {
            if (!projectStats[t.projectCode]) {
                projectStats[t.projectCode] = 0;
            }
            projectStats[t.projectCode] += t.hours;
        });

        // 按状态统计
        const allTimesheets = await this.timesheetRepository.find({
            where: userCode ? { userCode } : {},
        });
        const statusStats = {
            draft: allTimesheets.filter((t) => t.status === 1).length,
            pending: allTimesheets.filter((t) => t.status === 2).length,
            approved: allTimesheets.filter((t) => t.status === 3).length,
            rejected: allTimesheets.filter((t) => t.status === 4).length,
        };

        return {
            totalHours,
            totalRecords: timesheets.length,
            projectStats,
            statusStats,
        };
    }

    /**
     * 查询指定日期范围的工时
     */
    async getTimesheetsByDateRange(
        projectCode: string,
        startDate: string,
        endDate: string,
    ): Promise<Timesheet[]> {
        const where: FindOptionsWhere<Timesheet> = {};
        where.projectCode = In(projectCode.split(','));
        where.workDate = Between(new Date(startDate), new Date(endDate));
        where.status = 3;
        return this.timesheetRepository.find({ where });
    }

    /**
     * 生成工时编码
     */
    private async generateTimesheetCode(): Promise<string> {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

        // 查询今天已有的工时记录数量
        const count = await this.timesheetRepository
            .createQueryBuilder('timesheet')
            .where('timesheet.timesheetCode LIKE :prefix', { prefix: `TS-${dateStr}-%` })
            .getCount();

        const sequence = (count + 1).toString().padStart(5, '0');
        return `TS-${dateStr}-${sequence}`;
    }

    /**
     * 验证是否为项目经理
     */
    private async isProjectManager(projectCode: string, userCode: string): Promise<boolean> {
        const projects = await this.projectService.getProject();
        const project = projects.find((p) => p.projectCode === projectCode);
        return project?.managerUserCode === userCode;
    }

    /**
     * 验证是否为项目成员
     */
    private async isProjectMember(projectCode: string, userCode: string): Promise<boolean> {
        const members = await this.projectService.getProjectMembers(projectCode);
        const isMember = members.some((m) => m.userCode === userCode);

        // 项目经理也算项目成员
        const isManager = await this.isProjectManager(projectCode, userCode);

        return isMember || isManager;
    }

    /**
     * 构建TimesheetVo列表
     */
    private async buildTimesheetVos(timesheets: Timesheet[]): Promise<TimesheetVo[]> {
        return Promise.all(
            timesheets.map(async (timesheet) => {
                const vo: TimesheetVo = { ...timesheet } as TimesheetVo;

                // 获取用户姓名
                const user = await this.userService.findByUserCode(timesheet.userCode);
                vo.userName = user?.userName ?? undefined;

                // 获取项目名称
                const projects = await this.projectService.getProject();
                const project = projects.find((p) => p.projectCode === timesheet.projectCode);
                vo.projectName = project?.projectName ?? undefined;

                // 获取审核人姓名
                if (timesheet.reviewerUserCode) {
                    const reviewer = await this.userService.findByUserCode(
                        timesheet.reviewerUserCode,
                    );
                    vo.reviewerUserName = reviewer?.userName ?? undefined;
                }

                // 状态文本
                const statusMap: Record<number, string> = {
                    1: '草稿',
                    2: '待审核',
                    3: '已通过',
                    4: '已驳回',
                };
                vo.statusText = statusMap[timesheet.status] ?? undefined;

                return vo;
            }),
        );
    }
}
