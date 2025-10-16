import { Injectable, Logger } from '@nestjs/common';
import { Timeout, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ReportConfigService } from '../report-config/report-config.service';
import ExcelService from '../excel/excel.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly reportConfigService: ReportConfigService,
        private readonly excelService: ExcelService,
        private readonly mailService: MailService,
    ) {}

    /**
     * 应用启动后10秒执行一次 - 初始化任务
     */
    @Timeout(10000)
    async handleInitialization() {
        this.logger.log('执行应用初始化任务');
        // 1. 加载配置
        // 2. 预热缓存
        // 3. 检查系统状态
        // 4. 加载报表定时任务
        await this.loadReportConfigTasks();
    }

    /**
     * 加载报表配置并注册定时任务
     */
    async loadReportConfigTasks(): Promise<void> {
        try {
            this.logger.log('开始加载报表定时任务配置');

            // 获取所有启用的报表配置
            const configs = await this.reportConfigService.getEnabledConfigs();

            if (!configs || configs.length === 0) {
                this.logger.log('没有启用的报表配置');
                // 清理所有已注册的报表定时任务
                this.clearAllReportTasks();
                return;
            }

            // 为每个配置创建定时任务
            for (const config of configs) {
                try {
                    const jobName = `report-task-${config.uuid}`;
                    // 如果任务已存在，先删除
                    try {
                        const existingJob = this.schedulerRegistry.getCronJob(jobName);
                        if (existingJob) {
                            existingJob.stop();
                            this.schedulerRegistry.deleteCronJob(jobName);
                        }
                    } catch (e) {
                        // 任务不存在，忽略错误
                    }

                    // 创建新的定时任务
                    const job = new CronJob(
                        config.cronExpression,
                        async () => {
                            await this.executeReportTask(config);
                        },
                        null,
                        true,
                        'Asia/Shanghai',
                    );

                    // 注册任务
                    this.schedulerRegistry.addCronJob(jobName, job);

                    this.logger.log(
                        `报表定时任务已注册: ${config.reportName} (${config.cronExpression})`,
                    );
                } catch (error) {
                    this.logger.error(`注册报表任务失败: ${config.reportName}`, error.stack);
                }
            }

            this.logger.log(`成功加载 ${configs.length} 个报表定时任务`);
        } catch (error) {
            this.logger.error('加载报表定时任务失败', error.stack);
        }
    }

    /**
     * 清理所有已注册的报表定时任务
     */
    private clearAllReportTasks(): void {
        try {
            // 获取所有已注册的 CronJob
            const jobs = this.schedulerRegistry.getCronJobs();

            let clearedCount = 0;

            // 遍历并删除所有以 'report-task-' 开头的任务
            jobs.forEach((job, jobName) => {
                if (jobName.startsWith('report-task-')) {
                    try {
                        job.stop();
                        this.schedulerRegistry.deleteCronJob(jobName);
                        clearedCount++;
                        this.logger.log(`已清理报表任务: ${jobName}`);
                    } catch (error) {
                        this.logger.error(`清理报表任务失败: ${jobName}`, error.stack);
                    }
                }
            });

            if (clearedCount > 0) {
                this.logger.log(`共清理 ${clearedCount} 个报表定时任务`);
            } else {
                this.logger.log('没有需要清理的报表任务');
            }
        } catch (error) {
            this.logger.error('清理报表任务时发生错误', error.stack);
        }
    }

    /**
     * 执行单个报表任务
     * @param config 报表配置
     */
    async executeReportTask(config: any): Promise<void> {
        try {
            this.logger.log(`开始执行报表任务: ${config.reportName}`);

            // 1. 生成 Excel 报表
            const { buffer, filename } = await this.excelService.exportProjectTimeRecords(
                config.filterConditions,
            );

            // 2. 准备邮件内容
            const subject = `${config.reportName} - ${this.getLastMonthString()}`;
            const content = `
                <h3>${config.reportName}</h3>
                <p>您好，</p>
                <p>附件为${this.getLastMonthString()}的工时报表，请查收。</p>
                <p>此邮件由系统自动发送，请勿回复。</p>
                <br>
            `;

            // 3. 发送邮件
            await this.mailService.sendMailWithAttachment(
                config.recipientEmails,
                subject,
                content,
                [{ filename, content: buffer }],
            );

            this.logger.log(`报表任务执行成功: ${config.reportName}`);
        } catch (error) {
            this.logger.error(`报表任务执行失败: ${config.reportName}`, error.stack);
        }
    }

    /**
     * 重新加载所有报表定时任务
     */
    async reloadReportTasks(): Promise<void> {
        this.logger.log('重新加载报表定时任务');
        await this.loadReportConfigTasks();
    }

    /**
     * 获取上个月的年月
     * @returns 上个月的年月
     */
    getLastMonthString() {
        // 计算上个月的年月
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-11

        let lastMonthYear: number;
        let lastMonthValue: number;

        if (currentMonth === 0) {
            // 当前是1月，上个月是去年12月
            lastMonthYear = currentYear - 1;
            lastMonthValue = 12;
        } else {
            lastMonthYear = currentYear;
            lastMonthValue = currentMonth; // getMonth()返回0-11，所以不需要+1
        }

        const lastMonthString = `${lastMonthYear}年${lastMonthValue}月`;
        return lastMonthString;
    }
}
