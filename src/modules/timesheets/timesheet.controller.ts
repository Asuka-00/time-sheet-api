import { Body, Controller, Delete, Get, Post, Put, Query } from '@nestjs/common';
import { TimesheetService } from './timesheet.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { BatchCreateTimesheetDto } from './dto/batch-create-timesheet.dto';
import { UpdateTimesheetDto } from './dto/update-timesheet.dto';
import { ReviewTimesheetDto } from './dto/review-timesheet.dto';
import { TimesheetVo } from './dto/timesheet.vo';
import { TimesheetQueryDto } from './dto/timesheet-query.dto';
import { TimesheetStatisticsDto } from './dto/timesheet-statistics.dto';
import { PageResult, Result, SUCCESS_CODES } from 'src/common';

@ApiTags('工时管理')
@ApiBearerAuth()
@Controller('timesheet')
export class TimesheetController {
    constructor(private readonly timesheetService: TimesheetService) {}

    @ApiOperation({ summary: '创建工时记录', description: '员工创建工时记录，默认为草稿状态' })
    @ApiResponse({ status: 200, description: '创建成功' })
    @ApiResponse({ status: 400, description: '参数错误或业务规则验证失败' })
    @ApiResponse({ status: 403, description: '权限不足' })
    @ApiResponse({ status: 404, description: '项目不存在' })
    @ApiResponse({ status: 409, description: '该日期已存在工时记录' })
    @Post('create')
    async createTimesheet(@Body() dto: CreateTimesheetDto): Promise<Result<void>> {
        await this.timesheetService.createTimesheet(dto);
        return Result.success(undefined, SUCCESS_CODES.TIMESHEET.CREATE_SUCCESS);
    }

    @ApiOperation({
        summary: '批量创建工时记录',
        description: '批量创建多条工时记录，全部为草稿状态',
    })
    @ApiResponse({ status: 200, description: '批量创建成功' })
    @ApiResponse({ status: 400, description: '参数错误或业务规则验证失败' })
    @ApiResponse({ status: 403, description: '权限不足' })
    @Post('batch-create')
    async batchCreateTimesheets(@Body() body: BatchCreateTimesheetDto): Promise<Result<any>> {
        const result = await this.timesheetService.batchCreateTimesheets(body.timesheets);
        return Result.success(
            {
                successCount: result.successCount,
                failedCount: result.failedCount,
                errors: result.errors,
            },
            SUCCESS_CODES.TIMESHEET.BATCH_CREATE_SUCCESS,
        );
    }

    @ApiOperation({ summary: '更新工时记录', description: '更新草稿状态的工时记录' })
    @ApiResponse({ status: 200, description: '更新成功' })
    @ApiResponse({ status: 400, description: '只能修改草稿状态的工时记录' })
    @ApiResponse({ status: 403, description: '只能修改自己的工时记录' })
    @ApiResponse({ status: 404, description: '工时记录不存在' })
    @Put('update')
    async updateTimesheet(@Body() dto: UpdateTimesheetDto): Promise<Result<void>> {
        await this.timesheetService.updateTimesheet(dto);
        return Result.success(undefined, SUCCESS_CODES.TIMESHEET.UPDATE_SUCCESS);
    }

    @ApiOperation({ summary: '删除工时记录', description: '删除草稿状态的工时记录' })
    @ApiResponse({ status: 200, description: '删除成功' })
    @ApiResponse({ status: 400, description: '只能删除草稿状态的工时记录' })
    @ApiResponse({ status: 403, description: '只能删除自己的工时记录' })
    @ApiResponse({ status: 404, description: '工时记录不存在' })
    @ApiQuery({ name: 'uuid', required: true, description: '工时记录ID' })
    @Delete('delete')
    async deleteTimesheet(@Query('uuid') uuid: string): Promise<Result<void>> {
        await this.timesheetService.deleteTimesheet(uuid);
        return Result.success(undefined, SUCCESS_CODES.TIMESHEET.DELETE_SUCCESS);
    }

    @ApiOperation({ summary: '提交工时审核', description: '将草稿状态的工时记录提交审核' })
    @ApiResponse({ status: 200, description: '提交成功' })
    @ApiResponse({ status: 400, description: '只能提交草稿状态的工时记录' })
    @ApiResponse({ status: 403, description: '只能提交自己的工时记录' })
    @ApiResponse({ status: 404, description: '工时记录不存在' })
    @ApiQuery({ name: 'uuid', required: true, description: '工时记录ID' })
    @Post('submit')
    async submitTimesheet(@Query('uuid') uuid: string): Promise<Result<void>> {
        await this.timesheetService.submitTimesheet(uuid);
        return Result.success(undefined, SUCCESS_CODES.TIMESHEET.SUBMIT_SUCCESS);
    }

    @ApiOperation({ summary: '批量提交工时审核', description: '批量提交多条工时记录' })
    @ApiResponse({ status: 200, description: '提交成功' })
    @Post('batch-submit')
    async batchSubmitTimesheets(@Body() body: { uuids: string[] }): Promise<Result<void>> {
        await this.timesheetService.batchSubmitTimesheets(body.uuids);
        return Result.success(undefined, SUCCESS_CODES.TIMESHEET.BATCH_SUBMIT_SUCCESS);
    }

    @ApiOperation({ summary: '撤回工时审核', description: '将待审核状态的工时记录撤回为草稿' })
    @ApiResponse({ status: 200, description: '撤回成功' })
    @ApiResponse({ status: 400, description: '只能撤回待审核状态的工时记录' })
    @ApiResponse({ status: 403, description: '只能撤回自己的工时记录' })
    @ApiResponse({ status: 404, description: '工时记录不存在' })
    @ApiQuery({ name: 'uuid', required: true, description: '工时记录ID' })
    @Post('withdraw')
    async withdrawTimesheet(@Query('uuid') uuid: string): Promise<Result<void>> {
        await this.timesheetService.withdrawTimesheet(uuid);
        return Result.success(undefined, SUCCESS_CODES.TIMESHEET.WITHDRAW_SUCCESS);
    }

    @ApiOperation({ summary: '审核工时记录', description: '项目经理审核工时记录，通过或驳回' })
    @ApiResponse({ status: 200, description: '审核成功' })
    @ApiResponse({ status: 400, description: '只能审核待审核状态的工时' })
    @ApiResponse({ status: 403, description: '您没有权限审核此工时' })
    @ApiResponse({ status: 404, description: '工时记录不存在' })
    @Post('review')
    async reviewTimesheet(@Body() dto: ReviewTimesheetDto): Promise<Result<void>> {
        await this.timesheetService.reviewTimesheet(dto);
        return Result.success(undefined, SUCCESS_CODES.TIMESHEET.REVIEW_SUCCESS);
    }

    @ApiOperation({ summary: '批量审核工时记录', description: '批量审核多条工时记录' })
    @ApiResponse({ status: 200, description: '审核成功' })
    @Post('batch-review')
    async batchReviewTimesheets(
        @Body() body: { reviews: ReviewTimesheetDto[] },
    ): Promise<Result<void>> {
        await this.timesheetService.batchReviewTimesheets(body.reviews);
        return Result.success(undefined, SUCCESS_CODES.TIMESHEET.BATCH_REVIEW_SUCCESS);
    }

    @ApiOperation({
        summary: '分页查询工时列表',
        description: '支持多条件筛选的分页查询工时记录',
    })
    @ApiResponse({ status: 200, description: '查询成功' })
    @Get('list')
    async getTimesheetList(
        @Query() query: TimesheetQueryDto,
    ): Promise<Result<PageResult<TimesheetVo>>> {
        const current = Number(query.current) || 1;
        const size = Number(query.size) || 10;
        const { records, total } = await this.timesheetService.getTimesheetList(query);
        return Result.page(records, total, current, size);
    }

    @ApiOperation({
        summary: '查询我的工时',
        description: '查询当前登录用户的工时记录',
    })
    @ApiResponse({ status: 200, description: '查询成功' })
    @Get('my-timesheets')
    async getMyTimesheets(
        @Query() query: TimesheetQueryDto,
    ): Promise<Result<PageResult<TimesheetVo>>> {
        const current = Number(query.current) || 1;
        const size = Number(query.size) || 10;
        const { records, total } = await this.timesheetService.getMyTimesheets(query);
        return Result.page(records, total, current, size);
    }

    @ApiOperation({
        summary: '查询待我审核的工时',
        description: '查询当前用户作为项目经理需要审核的工时记录',
    })
    @ApiResponse({ status: 200, description: '查询成功' })
    @Get('pending-review')
    async getPendingReviewTimesheets(
        @Query() query: TimesheetQueryDto,
    ): Promise<Result<PageResult<TimesheetVo>>> {
        const current = Number(query.current) || 1;
        const size = Number(query.size) || 10;
        const { records, total } = await this.timesheetService.getPendingReviewTimesheets(query);
        return Result.page(records, total, current, size);
    }

    @ApiOperation({
        summary: '查询项目经理管理的工时',
        description: '查询当前用户作为项目经理管理的所有项目的工时记录，支持多条件筛选',
    })
    @ApiResponse({ status: 200, description: '查询成功' })
    @ApiResponse({ status: 401, description: '未授权' })
    @Get('project-manager-timesheets')
    async getProjectManagerTimesheets(
        @Query() query: TimesheetQueryDto,
    ): Promise<Result<PageResult<TimesheetVo>>> {
        const current = Number(query.current) || 1;
        const size = Number(query.size) || 10;
        const { records, total } = await this.timesheetService.getProjectManagerTimesheets(query);
        return Result.page(records, total, current, size);
    }

    @ApiOperation({ summary: '查询工时详情', description: '根据工时记录ID查询详细信息' })
    @ApiResponse({ status: 200, description: '查询成功' })
    @ApiResponse({ status: 404, description: '工时记录不存在' })
    @ApiQuery({ name: 'uuid', required: true, description: '工时记录ID' })
    @Get('detail')
    async getTimesheetDetail(@Query('uuid') uuid: string): Promise<Result<TimesheetVo>> {
        const detail = await this.timesheetService.getTimesheetDetail(uuid);
        return Result.success(detail);
    }

    @ApiOperation({
        summary: '工时统计',
        description: '统计工时数据，包括总工时、按项目统计、按状态统计',
    })
    @ApiResponse({ status: 200, description: '统计成功' })
    @ApiQuery({ name: 'userCode', required: false, description: '用户编码' })
    @ApiQuery({ name: 'projectCode', required: false, description: '项目编码' })
    @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
    @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
    @Get('statistics')
    async getTimesheetStatistics(
        @Query('userCode') userCode?: string,
        @Query('projectCode') projectCode?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ): Promise<Result<TimesheetStatisticsDto>> {
        const statistics = await this.timesheetService.getTimesheetStatistics(
            userCode,
            projectCode,
            startDate,
            endDate,
        );
        return Result.success(statistics);
    }
}
