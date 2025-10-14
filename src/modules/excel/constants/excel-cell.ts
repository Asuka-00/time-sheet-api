/**
 * @FilePath     : /time-sheet-api/src/modules/excel/constants/excel-cell.ts
 * @Description  : RD Excel 单元格常量
 * @Author       : Kairo kairo.ma@seminnov.com
 * @Version      : 0.0.1
 * @LastEditors  : Kairo kairo.ma@seminnov.com
 * @LastEditTime : 2025-10-10 18:50:06
 */

export const EXCEL_CELL = {
    RD: {
        PROJECT_LIST: {
            YEAR_MONTH: 'K2',
            DIRECTOR_NAME: 'U2',
            REPORT_CODE: 'AA2',
            FIRST_INDEX: 'A4',
            PROJECT_FIRST_NAME: 'B4',
            FIRST_DAY: 'C4',
            FIRST_DAY_TOTAL: 'C5',
            PROJECT_TOTAL: 'AH4',
            STATISTIC_NAME: 'A8',
            AUDIT_NAME: 'A9',
        },
        PROJECT_TIME_RECORD: {
            YEAR_MONTH: 'E2',
            DIRECTOR_NAME: 'G2',
            REPORT_CODE: 'I2',
            FIRST_INDEX: 'A4',
            USER_DEPARTMENT: 'B4',
            USER_CODE: 'C4',
            USER_NAME: 'D4',
            USER_MONTH_TOTAL: 'E4',
            USER_FIRST_PROJECT_NAME: 'F3',
            USER_FIRST_PROJECT_TOTAL: 'F4',
            STATISTIC_NAME: 'A8',
            AUDIT_NAME: 'A9',
        },
    },
};

/**
 * 将 Excel 列字母转换为列号
 * @param col - 列字母 (A, B, ..., Z, AA, AB, ...)
 * @returns 列号 (1, 2, ..., 26, 27, 28, ...)
 * @example columnToNumber('A') // 1
 * @example columnToNumber('Z') // 26
 * @example columnToNumber('AA') // 27
 */
export function columnToNumber(col: string): number {
    if (!col || typeof col !== 'string') {
        throw new Error('Invalid column string');
    }

    col = col.toUpperCase();
    let result = 0;

    for (let i = 0; i < col.length; i++) {
        const charCode = col.charCodeAt(i);
        if (charCode < 65 || charCode > 90) {
            // A-Z
            throw new Error(`Invalid column character: ${col[i]}`);
        }
        result = result * 26 + (charCode - 64);
    }

    return result;
}

/**
 * 将列号转换为 Excel 列字母
 * @param num - 列号 (1, 2, ..., 26, 27, 28, ...)
 * @returns 列字母 (A, B, ..., Z, AA, AB, ...)
 * @example numberToColumn(1) // 'A'
 * @example numberToColumn(26) // 'Z'
 * @example numberToColumn(27) // 'AA'
 */
export function numberToColumn(num: number): string {
    if (!Number.isInteger(num) || num < 1) {
        throw new Error('Column number must be a positive integer');
    }

    let result = '';
    let n = num;

    while (n > 0) {
        const remainder = (n - 1) % 26;
        result = String.fromCharCode(65 + remainder) + result;
        n = Math.floor((n - 1) / 26);
    }

    return result;
}

/**
 * 解析 Excel 单元格坐标
 * @param cell - 单元格坐标 (如 'A2', 'AA10')
 * @returns { col: number, row: number }
 * @example parseCellAddress('A2') // { col: 1, row: 2 }
 * @example parseCellAddress('AA10') // { col: 27, row: 10 }
 */
export function parseCellAddress(cell: string): { col: number; row: number } {
    if (!cell || typeof cell !== 'string') {
        throw new Error('Invalid cell address');
    }

    const match = cell.match(/^([A-Za-z]+)(\d+)$/);
    if (!match) {
        throw new Error(`Invalid cell address format: ${cell}`);
    }

    const colStr = match[1];
    const rowStr = match[2];

    const col = columnToNumber(colStr);
    const row = parseInt(rowStr, 10);

    if (row < 1) {
        throw new Error(`Invalid row number: ${row}`);
    }

    return { col, row };
}

/**
 * 生成 Excel 单元格坐标
 * @param col - 列号
 * @param row - 行号
 * @returns 单元格坐标 (如 'A2', 'AA10')
 * @example createCellAddress(1, 2) // 'A2'
 * @example createCellAddress(27, 10) // 'AA10'
 */
export function createCellAddress(col: number, row: number): string {
    if (!Number.isInteger(row) || row < 1) {
        throw new Error('Row number must be a positive integer');
    }

    const colStr = numberToColumn(col);
    return `${colStr}${row}`;
}

/**
 * 计算偏移后的单元格坐标
 * @param cell - 原单元格坐标
 * @param colOffset - 列偏移量 (默认为 0)
 * @param rowOffset - 行偏移量 (默认为 0)
 * @returns 新的单元格坐标
 * @example offsetCell('A2', 1, 0) // 'B2'
 * @example offsetCell('A2', 0, 1) // 'A3'
 * @example offsetCell('Z2', 1, 0) // 'AA2'
 */
export function offsetCell(cell: string, colOffset: number = 0, rowOffset: number = 0): string {
    const { col, row } = parseCellAddress(cell);
    const newCol = col + colOffset;
    const newRow = row + rowOffset;

    if (newCol < 1) {
        throw new Error(`Column offset results in invalid column: ${newCol}`);
    }
    if (newRow < 1) {
        throw new Error(`Row offset results in invalid row: ${newRow}`);
    }

    return createCellAddress(newCol, newRow);
}
