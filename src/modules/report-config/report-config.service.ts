import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { BusinessException, ERROR_CODES } from '../../common';
import { TasksService } from '../schedule/tasks.service';
import { ReportConfigDto } from './dto/report-config.dto';
import { ReportConfigVo } from './dto/report-config.vo';
import { ReportConfig } from './entities/report-config.entity';

@Injectable()
export class ReportConfigService {
    constructor(
        @InjectRepository(ReportConfig)
        private readonly reportConfigRepository: Repository<ReportConfig>,
        @Inject(forwardRef(() => TasksService))
        private readonly tasksService: TasksService,
    ) {}

    /**
     * 创建报表配置
     * @param dto 报表配置信息
     */
    async createReportConfig(dto: ReportConfigDto): Promise<void> {
        // 判断报表类型是否已存在
        const existingConfig = await this.reportConfigRepository.findOneBy({
            reportType: dto.reportType,
        });
        if (existingConfig) {
            throw new BusinessException(ERROR_CODES.REPORT_CONFIG.CREATE.TYPE_ALREADY_EXISTS, 400);
        }

        // 转换 DTO 为 Entity
        const config = new ReportConfig();
        config.reportType = dto.reportType;
        config.reportName = dto.reportName;
        config.cronExpression = dto.cronExpression;
        config.recipientEmails = dto.recipientEmails;
        config.filterConditions = dto.filterConditions || '';
        config.isEnabled = dto.isEnabled !== undefined ? dto.isEnabled : true;
        config.description = dto.description || '';

        // 保存配置
        await this.reportConfigRepository.save(config);
        await this.tasksService.reloadReportTasks();
    }

    /**
     * 分页查询报表配置列表
     * @param current 当前页码
     * @param size 每页大小
     * @param searchKey 搜索关键字（可选）
     * @returns 分页数据和总数
     */
    async getReportConfigList(
        current: number,
        size: number,
        searchKey?: string,
    ): Promise<{ records: ReportConfigVo[]; total: number }> {
        // 计算跳过的记录数
        const skip = (current - 1) * size;

        // 构建查询条件
        let where: FindOptionsWhere<ReportConfig> | FindOptionsWhere<ReportConfig>[] = {};
        if (searchKey) {
            where = [
                { reportName: Like(`%${searchKey}%`) },
                { description: Like(`%${searchKey}%`) },
            ];
        }

        // 执行分页查询
        const [records, total] = await this.reportConfigRepository.findAndCount({
            where,
            skip,
            take: size,
            order: {
                createdAt: 'DESC',
            },
        });

        // 转换为 VO
        const configVos: ReportConfigVo[] = records.map((config) => this.toVo(config));

        return { records: configVos, total };
    }

    /**
     * 查询报表配置
     * @param uuid 配置ID
     * @returns 报表配置信息
     */
    async getReportConfig(uuid?: string): Promise<ReportConfigVo[]> {
        const configs = await this.reportConfigRepository.find({ where: uuid ? { uuid } : {} });
        return configs.map((config) => this.toVo(config));
    }

    /**
     * 更新报表配置
     * @param dto 报表配置信息
     */
    async updateReportConfig(dto: ReportConfigDto): Promise<void> {
        if (!dto.uuid) {
            throw new BusinessException(ERROR_CODES.REPORT_CONFIG.COMMON.ID_REQUIRED, 400);
        }

        // 验证配置是否存在
        const existingConfig = await this.reportConfigRepository.findOneBy({ uuid: dto.uuid });
        if (!existingConfig) {
            throw new BusinessException(ERROR_CODES.REPORT_CONFIG.UPDATE.NOT_FOUND, 404);
        }

        // 更新字段
        existingConfig.reportName = dto.reportName;
        existingConfig.cronExpression = dto.cronExpression;
        existingConfig.recipientEmails = dto.recipientEmails;
        existingConfig.filterConditions = dto.filterConditions || '';
        existingConfig.isEnabled =
            dto.isEnabled !== undefined ? dto.isEnabled : existingConfig.isEnabled;
        existingConfig.description = dto.description || '';

        await this.reportConfigRepository.save(existingConfig);

        await this.tasksService.reloadReportTasks();
    }

    /**
     * 删除报表配置
     * @param uuid 配置ID
     */
    async deleteReportConfig(uuid: string): Promise<void> {
        const config = await this.reportConfigRepository.findOneBy({ uuid });
        if (!config) {
            throw new BusinessException(ERROR_CODES.REPORT_CONFIG.DELETE.NOT_FOUND, 404);
        }
        await this.reportConfigRepository.delete(uuid);
        await this.tasksService.reloadReportTasks();
    }

    /**
     * 启用/禁用报表配置
     * @param uuid 配置ID
     * @param isEnabled 是否启用
     */
    async toggleReportConfig(uuid: string, isEnabled: boolean): Promise<void> {
        const config = await this.reportConfigRepository.findOneBy({ uuid });
        if (!config) {
            throw new BusinessException(ERROR_CODES.REPORT_CONFIG.COMMON.NOT_FOUND, 404);
        }
        config.isEnabled = isEnabled;
        await this.reportConfigRepository.save(config);
        await this.tasksService.reloadReportTasks();
    }

    /**
     * 获取启用状态的配置
     * @param reportType 报表类型（可选）
     * @returns 启用的报表配置列表
     */
    async getEnabledConfigs(reportType?: string): Promise<ReportConfigVo[]> {
        const where: FindOptionsWhere<ReportConfig> = { isEnabled: true };
        if (reportType) {
            where.reportType = reportType;
        }
        const configs = await this.reportConfigRepository.find({ where });
        return configs.map((config) => this.toVo(config));
    }

    /**
     * 将 Entity 转换为 VO
     * @param config 配置实体
     * @returns 配置 VO
     */
    private toVo(config: ReportConfig): ReportConfigVo {
        const vo = { ...config } as ReportConfigVo;

        // 解析逗号分隔的字符串字段
        vo.recipientEmailsArray = config.recipientEmails
            ? config.recipientEmails
                  .split(',')
                  .map((e) => e.trim())
                  .filter((e) => e)
            : [];

        vo.projectCodes = config.filterConditions
            ? config.filterConditions
                  .split(',')
                  .map((e) => e.trim())
                  .filter((e) => e)
            : [];

        return vo;
    }
}
