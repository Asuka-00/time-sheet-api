/**
 * 工时统计响应DTO
 */
export class TimesheetStatisticsDto {
    /**
     * 总工时
     */
    totalHours: number;

    /**
     * 总记录数
     */
    totalRecords: number;

    /**
     * 按项目统计的工时
     * key: 项目编码, value: 工时数
     */
    projectStats: Record<string, number>;

    /**
     * 按状态统计的记录数
     */
    statusStats: {
        /** 草稿状态数量 */
        draft: number;
        /** 待审核状态数量 */
        pending: number;
        /** 已通过状态数量 */
        approved: number;
        /** 已驳回状态数量 */
        rejected: number;
    };
}
