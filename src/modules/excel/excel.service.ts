import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import { ProjectService } from '../projects/project.service';
import { TimesheetService } from '../timesheets/timesheet.service';
import { UserService } from '../users/user.service';
import { EXCEL_CELL, offsetCell } from './constants/excel-cell';

@Injectable()
export default class ExcelService {
    constructor(
        private readonly timesheetService: TimesheetService,
        private readonly projectService: ProjectService,
        private readonly userService: UserService,
    ) {}
    private readonly logger = new Logger(ExcelService.name);
    private reportCodeCache: Map<string, number> = new Map();

    /**
     * 获取模板文件路径
     * @param filename 模板文件名
     * @returns 模板文件的绝对路径
     */
    private getTemplatePath(filename: string): string {
        // 构建模板文件路径
        // 开发环境: src/modules/excel/template/
        // 生产环境: dist/modules/excel/template/
        return path.join(__dirname, 'template', filename);
    }

    /**
     * 导出各个项目工时记录
     * @param projectCodes 项目编号列表（可选），用于过滤特定项目
     * @returns Excel 文件的 Buffer 和文件名
     */
    async exportProjectTimeRecords(
        projectCodes?: string,
    ): Promise<{ buffer: Buffer; filename: string }> {
        // 读取RD报表excel模板
        const workbook = new ExcelJS.Workbook();
        const templatePath = this.getTemplatePath('rd_report.xlsx');

        // 检查文件是否存在
        if (!fs.existsSync(templatePath)) {
            throw new Error(`模板文件不存在: ${templatePath}`);
        }

        this.logger.debug(`加载模板文件: ${templatePath}`);
        await workbook.xlsx.readFile(templatePath);

        // 获取工作表1
        const worksheet1 = workbook.getWorksheet(1);

        // 获取上个月份开始结束日期
        const now = new Date();
        const lastMonthStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEndDate = new Date(now.getFullYear(), now.getMonth(), 0);

        // 获取所有项目信息
        const projects = await this.projectService.getProject();
        // 获取所有对应工时记录
        const timeRecords = await this.timesheetService.getTimesheetsByDateRange(
            projectCodes || '',
            lastMonthStartDate.toISOString(),
            lastMonthEndDate.toISOString(),
        );
        this.logger.debug('项目：', projects);
        this.logger.debug('工时记录：', timeRecords);

        if (!projects || !timeRecords) {
            throw new Error('无法获取项目或工时记录数据');
        }

        const reportCode = this.getReportCode();
        // 处理工作表1
        {
            if (worksheet1) {
                worksheet1.getCell(EXCEL_CELL.RD.PROJECT_LIST.YEAR_MONTH).value =
                    '月份：' + this.getLastMonthString();
                worksheet1.getCell(EXCEL_CELL.RD.PROJECT_LIST.DIRECTOR_NAME).value =
                    '研发负责人：' + (projects[0]?.directorUserName || '');
                worksheet1.getCell(EXCEL_CELL.RD.PROJECT_LIST.REPORT_CODE).value =
                    '单据编号：' + reportCode;
            }
            // 填写表格

            // 初始化项目索引和日期列汇总
            let projectIndex = 0; // 项目计数器
            const dailyTotals: { [day: number]: number } = {}; // 每日总工时

            // 填充项目工时数据
            for (const project of projects) {
                const projectTimeRecords = timeRecords.filter(
                    (t) => t.projectCode === project.projectCode,
                );

                if (projectTimeRecords.length > 0 && worksheet1) {
                    const currentRow = 4 + projectIndex; // 当前项目行号

                    // 如果不是第一个项目，需要在合计行前插入新行
                    if (projectIndex > 0) {
                        // 在当前位置插入一行空行
                        worksheet1.spliceRows(currentRow, 0, []);
                        // 复制第4行的样式到新行
                        const templateRow = worksheet1.getRow(4);
                        const newRow = worksheet1.getRow(currentRow);
                        newRow.height = templateRow.height;
                        // 复制每个单元格的样式
                        templateRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                            const newCell = newRow.getCell(colNumber);
                            this.copyCellStyle(cell, newCell);
                        });
                    }

                    // 填写序号和项目名称
                    const rowOffset = currentRow - 4;
                    worksheet1.getCell(
                        offsetCell(EXCEL_CELL.RD.PROJECT_LIST.FIRST_INDEX, 0, rowOffset),
                    ).value = projectIndex + 1;
                    worksheet1.getCell(
                        offsetCell(EXCEL_CELL.RD.PROJECT_LIST.PROJECT_FIRST_NAME, 0, rowOffset),
                    ).value = project.projectCode + '-' + project.projectName;

                    let projectTotal = 0;

                    // 初始化所有日期单元格为0
                    for (let day = 1; day <= 31; day++) {
                        const dayCell = offsetCell(
                            EXCEL_CELL.RD.PROJECT_LIST.FIRST_DAY,
                            day - 1,
                            0,
                        );
                        const dayColumn = dayCell.replace(/\d+/g, ''); // 提取列字母
                        const cellAddress = `${dayColumn}${currentRow}`;
                        worksheet1.getCell(cellAddress).value = 0;
                    }

                    // 填充每日工时
                    projectTimeRecords.forEach((timeRecord) => {
                        const day = new Date(timeRecord.workDate).getDate(); // 1-31
                        // 计算日期对应的列（C列开始，C=1号，D=2号...）
                        const dayCell = offsetCell(
                            EXCEL_CELL.RD.PROJECT_LIST.FIRST_DAY,
                            day - 1,
                            0,
                        );
                        const dayColumn = dayCell.replace(/\d+/g, ''); // 提取列字母
                        const cellAddress = `${dayColumn}${currentRow}`;
                        const currentValue = (worksheet1.getCell(cellAddress).value as number) || 0;
                        worksheet1.getCell(cellAddress).value = currentValue + timeRecord.hours;

                        projectTotal += timeRecord.hours;
                        dailyTotals[day] = (dailyTotals[day] || 0) + timeRecord.hours;
                    });

                    // 填写项目合计
                    const totalColumn = EXCEL_CELL.RD.PROJECT_LIST.PROJECT_TOTAL.replace(
                        /\d+/g,
                        '',
                    );
                    worksheet1.getCell(`${totalColumn}${currentRow}`).value = projectTotal;

                    projectIndex++;
                }
            }

            // 填充合计行（动态计算位置）
            if (worksheet1) {
                const totalRowIndex = 4 + projectIndex; // 合计行在所有项目行之后

                // 填写"合计："标签
                const totalRowOffset = totalRowIndex - 4;
                worksheet1.getCell(
                    offsetCell(EXCEL_CELL.RD.PROJECT_LIST.FIRST_INDEX, 0, totalRowOffset),
                ).value = '合计：';

                // 填写每日总工时
                for (let day = 1; day <= 31; day++) {
                    const dayCell = offsetCell(EXCEL_CELL.RD.PROJECT_LIST.FIRST_DAY, day - 1, 0);
                    const dayColumn = dayCell.replace(/\d+/g, ''); // 提取列字母
                    worksheet1.getCell(`${dayColumn}${totalRowIndex}`).value =
                        dailyTotals[day] || 0;
                }

                // 计算总合计
                const totalSum = Object.values(dailyTotals).reduce((sum, val) => sum + val, 0);
                const totalColumn = EXCEL_CELL.RD.PROJECT_LIST.PROJECT_TOTAL.replace(/\d+/g, '');
                worksheet1.getCell(`${totalColumn}${totalRowIndex}`).value = totalSum;

                // 填写审核信息（动态计算位置）
                const statisticRowIndex = totalRowIndex + 3; // 统计人行
                const auditRowIndex = totalRowIndex + 4; // 审核人行
                const statisticColumn = EXCEL_CELL.RD.PROJECT_LIST.STATISTIC_NAME.replace(
                    /\d+/g,
                    '',
                );
                const auditColumn = EXCEL_CELL.RD.PROJECT_LIST.AUDIT_NAME.replace(/\d+/g, '');
                worksheet1.getCell(`${statisticColumn}${statisticRowIndex}`).value = '统计人：马凯';
                worksheet1.getCell(`${auditColumn}${auditRowIndex}`).value =
                    '审核人：' + (projects[0]?.managerUserName || '');
            }
        }

        // ========== 处理 Sheet2: 研发人员工时汇总表 ==========
        const worksheet2 = workbook.getWorksheet(2);
        if (worksheet2 && projects.length > 0) {
            // 填写表头信息
            worksheet2.getCell(EXCEL_CELL.RD.PROJECT_TIME_RECORD.YEAR_MONTH).value =
                '月份：' + this.getLastMonthString();
            worksheet2.getCell(EXCEL_CELL.RD.PROJECT_TIME_RECORD.DIRECTOR_NAME).value =
                '研发负责人：' + (projects[0]?.directorUserName || '');
            worksheet2.getCell(EXCEL_CELL.RD.PROJECT_TIME_RECORD.REPORT_CODE).value =
                '单据编号：' + reportCode;

            // 动态添加项目列到第3行
            projects.forEach((project, index) => {
                const projectNameCell = offsetCell(
                    EXCEL_CELL.RD.PROJECT_TIME_RECORD.USER_FIRST_PROJECT_NAME,
                    index,
                    0,
                );
                worksheet2.getCell(projectNameCell).value = project.projectName;
            });

            // 构建用户工时数据结构
            const userCodes = [...new Set(timeRecords.map((r) => r.userCode))];
            const users = await this.userService.findByUserCodes(userCodes);

            // 用户工时映射
            const userTimeMap = new Map<
                string,
                {
                    userCode: string;
                    userName: string;
                    department: string;
                    projectHours: { [projectCode: string]: number };
                    totalHours: number;
                }
            >();

            timeRecords.forEach((record) => {
                if (!userTimeMap.has(record.userCode)) {
                    const user = users.find((u) => u.userCode === record.userCode);
                    userTimeMap.set(record.userCode, {
                        userCode: record.userCode,
                        userName: user?.userName || '',
                        department: user?.departmentName || '',
                        projectHours: {},
                        totalHours: 0,
                    });
                }

                const userData = userTimeMap.get(record.userCode)!;
                userData.projectHours[record.projectCode] =
                    (userData.projectHours[record.projectCode] || 0) + record.hours;
                userData.totalHours += record.hours;
            });

            // 填充用户数据行
            let userIndex = 0;
            const projectTotals: { [projectCode: string]: number } = {};

            for (const [, userData] of userTimeMap) {
                const currentRow = 4 + userIndex;

                // 如果不是第一行，插入新行
                if (userIndex > 0) {
                    worksheet2.spliceRows(currentRow, 0, []);
                    // 复制第4行的样式到新行
                    const templateRow = worksheet2.getRow(4);
                    const newRow = worksheet2.getRow(currentRow);
                    newRow.height = templateRow.height;
                    templateRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                        const newCell = newRow.getCell(colNumber);
                        this.copyCellStyle(cell, newCell);
                    });
                }

                // 填写用户基本信息
                const userRowOffset = currentRow - 4;
                worksheet2.getCell(
                    offsetCell(EXCEL_CELL.RD.PROJECT_TIME_RECORD.FIRST_INDEX, 0, userRowOffset),
                ).value = userIndex + 1;
                worksheet2.getCell(
                    offsetCell(EXCEL_CELL.RD.PROJECT_TIME_RECORD.USER_DEPARTMENT, 0, userRowOffset),
                ).value = userData.department;
                worksheet2.getCell(
                    offsetCell(EXCEL_CELL.RD.PROJECT_TIME_RECORD.USER_CODE, 0, userRowOffset),
                ).value = userData.userCode;
                worksheet2.getCell(
                    offsetCell(EXCEL_CELL.RD.PROJECT_TIME_RECORD.USER_NAME, 0, userRowOffset),
                ).value = userData.userName;
                worksheet2.getCell(
                    offsetCell(
                        EXCEL_CELL.RD.PROJECT_TIME_RECORD.USER_MONTH_TOTAL,
                        0,
                        userRowOffset,
                    ),
                ).value = userData.totalHours;

                // 填写各项目工时
                projects.forEach((project, pIndex) => {
                    const projectHours = userData.projectHours[project.projectCode] || 0;
                    const projectCell = offsetCell(
                        EXCEL_CELL.RD.PROJECT_TIME_RECORD.USER_FIRST_PROJECT_TOTAL,
                        pIndex,
                        0,
                    );
                    const projectColumn = projectCell.replace(/\d+/g, '');
                    worksheet2.getCell(`${projectColumn}${currentRow}`).value = projectHours;

                    // 累加项目总工时
                    projectTotals[project.projectCode] =
                        (projectTotals[project.projectCode] || 0) + projectHours;
                });

                userIndex++;
            }

            // 填充合计行
            const totalRowIndex2 = 4 + userIndex;
            const totalRowOffset2 = totalRowIndex2 - 4;
            worksheet2.getCell(
                offsetCell(EXCEL_CELL.RD.PROJECT_TIME_RECORD.FIRST_INDEX, 0, totalRowOffset2),
            ).value = '合计：';

            // 填写本月总工时合计
            const totalHours = Array.from(userTimeMap.values()).reduce(
                (sum, u) => sum + u.totalHours,
                0,
            );
            worksheet2.getCell(
                offsetCell(EXCEL_CELL.RD.PROJECT_TIME_RECORD.USER_MONTH_TOTAL, 0, totalRowOffset2),
            ).value = totalHours;

            // 填写各项目总工时
            projects.forEach((project, pIndex) => {
                const projectCell = offsetCell(
                    EXCEL_CELL.RD.PROJECT_TIME_RECORD.USER_FIRST_PROJECT_TOTAL,
                    pIndex,
                    0,
                );
                const projectColumn = projectCell.replace(/\d+/g, '');
                worksheet2.getCell(`${projectColumn}${totalRowIndex2}`).value =
                    projectTotals[project.projectCode] || 0;
            });

            // 填写审核信息
            const statisticRowIndex2 = totalRowIndex2 + 3;
            const auditRowIndex2 = totalRowIndex2 + 4;
            const statisticColumn2 = EXCEL_CELL.RD.PROJECT_TIME_RECORD.STATISTIC_NAME.replace(
                /\d+/g,
                '',
            );
            const auditColumn2 = EXCEL_CELL.RD.PROJECT_TIME_RECORD.AUDIT_NAME.replace(/\d+/g, '');
            worksheet2.getCell(`${statisticColumn2}${statisticRowIndex2}`).value = '统计人：马凯';
            worksheet2.getCell(`${auditColumn2}${auditRowIndex2}`).value =
                '审核人：' + (projects[0]?.managerUserName || '');
        }

        // 生成 Excel Buffer
        const buffer = await workbook.xlsx.writeBuffer();
        const filename = `工时报表_${this.getLastMonthString()}_${reportCode}.xlsx`;

        return { buffer: Buffer.from(buffer), filename };
    }

    /**
     * 获取上个月的天数
     * @returns 上个月的天数 (28-31)
     */
    private getLastMonthDays(): number {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 0).getDate();
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

    /**
     * 获取上个月单据编号
     * @returns 单据编号 2025080001
     */
    getReportCode() {
        // 清理过期缓存
        this.cleanExpiredCache();

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth()).padStart(2, '0'); // 两位月份

        // 生成缓存键（YYYYMM格式）
        const cacheKey = `${year}${month}`;

        // 从缓存中获取当前流水号，不存在则初始化为 0
        const currentSeq = this.reportCodeCache.get(cacheKey) || 0;

        // 递增流水号
        const nextSeq = currentSeq + 1;

        // 更新缓存
        this.reportCodeCache.set(cacheKey, nextSeq);

        // 生成四位流水号
        const seq = String(nextSeq).padStart(4, '0');

        return `${year}${month}${seq}`;
    }

    /**
     * 清理过期的缓存（非上月份）
     */
    private cleanExpiredCache(): void {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth()).padStart(2, '0');
        const currentKey = `${year}${month}`;

        // 删除所有非当前月份的缓存
        for (const key of this.reportCodeCache.keys()) {
            if (key !== currentKey) {
                this.reportCodeCache.delete(key);
            }
        }
    }

    /**
     * 安全地复制单元格样式（不复制公式）
     * @param sourceCell 源单元格
     * @param targetCell 目标单元格
     */
    private copyCellStyle(sourceCell: ExcelJS.Cell, targetCell: ExcelJS.Cell): void {
        targetCell.style = {
            font: sourceCell.style.font ? { ...sourceCell.style.font } : undefined,
            alignment: sourceCell.style.alignment ? { ...sourceCell.style.alignment } : undefined,
            border: sourceCell.style.border ? { ...sourceCell.style.border } : undefined,
            fill: sourceCell.style.fill ? { ...sourceCell.style.fill } : undefined,
            numFmt: sourceCell.style.numFmt,
        };
    }
}
