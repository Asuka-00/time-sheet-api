/**
 * 分页结果泛型接口
 * @template T 数据类型
 */
export interface PageResult<T> {
    /**
     * 当前页数据列表
     */
    records: T[];

    /**
     * 总记录数
     */
    total: number;

    /**
     * 当前页码
     */
    current: number;

    /**
     * 每页大小
     */
    size: number;

    /**
     * 总页数（可选）
     */
    pages?: number;
}

/**
 * 创建分页结果对象
 * @param records 当前页数据
 * @param total 总记录数
 * @param current 当前页码
 * @param size 每页大小
 * @returns PageResult对象
 */
export function createPageResult<T>(
    records: T[],
    total: number,
    current: number,
    size: number,
): PageResult<T> {
    const pages = Math.ceil(total / size);

    return {
        records,
        total,
        current,
        size,
        pages,
    };
}
