import {
    Body,
    Controller,
    Delete,
    Get,
    Post,
    Put,
    Query,
    Inject,
    forwardRef,
} from '@nestjs/common';
import { ReportConfigService } from './report-config.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportConfigDto } from './dto/report-config.dto';
import { ReportConfigVo } from './dto/report-config.vo';
import { PageResult, Result } from 'src/common';
import { TasksService } from '../schedule/tasks.service';

@ApiTags('报表配置管理')
@ApiBearerAuth()
@Controller('report-config')
export class ReportConfigController {
    constructor(
        private readonly reportConfigService: ReportConfigService,
        @Inject(forwardRef(() => TasksService))
        private readonly tasksService: TasksService,
    ) {}

    @ApiOperation({
        summary: '创建报表配置',
        description: '创建一个新的报表配置，用于定时发送报表',
    })
    @ApiResponse({ status: 200, description: '创建成功' })
    @ApiResponse({ status: 400, description: '报表类型已存在' })
    @Post('create')
    async createReportConfig(@Body() dto: ReportConfigDto): Promise<Result<void>> {
        await this.reportConfigService.createReportConfig(dto);
        return Result.success();
    }

    @ApiOperation({
        summary: '分页获取报表配置列表',
        description: '支持按报表名称、描述搜索的分页查询',
    })
    @ApiResponse({ status: 200, description: '查询成功，返回分页数据' })
    @ApiQuery({ name: 'current', required: false, description: '当前页码，默认为1', example: 1 })
    @ApiQuery({ name: 'size', required: false, description: '每页大小，默认为10', example: 10 })
    @ApiQuery({
        name: 'searchKey',
        required: false,
        description: '搜索关键字（报表名称或描述）',
        example: '月度项目汇总',
    })
    @Get('list')
    async getReportConfigList(
        @Query('current') current: number = 1,
        @Query('size') size: number = 10,
        @Query('searchKey') searchKey?: string,
    ): Promise<Result<PageResult<ReportConfigVo>>> {
        const pageNum = Number(current) || 1;
        const pageSize = Number(size) || 10;
        const { records, total } = await this.reportConfigService.getReportConfigList(
            pageNum,
            pageSize,
            searchKey,
        );
        return Result.page(records, total, pageNum, pageSize);
    }

    @ApiOperation({ summary: '查询报表配置', description: '根据配置ID查询指定报表配置信息' })
    @ApiResponse({ status: 200, description: '查询成功' })
    @ApiQuery({ name: 'uuid', required: false, description: '配置ID' })
    @Get('get')
    async getReportConfig(@Query('uuid') uuid?: string): Promise<Result<ReportConfigVo[]>> {
        const config = await this.reportConfigService.getReportConfig(uuid);
        return Result.success(config);
    }

    @ApiOperation({ summary: '更新报表配置', description: '更新指定报表配置信息' })
    @ApiResponse({ status: 200, description: '更新成功' })
    @ApiResponse({ status: 404, description: '配置不存在' })
    @Put('update')
    async updateReportConfig(@Body() dto: ReportConfigDto): Promise<Result<void>> {
        await this.reportConfigService.updateReportConfig(dto);
        return Result.success();
    }

    @ApiOperation({ summary: '删除报表配置', description: '根据配置ID删除指定报表配置' })
    @ApiResponse({ status: 200, description: '删除成功' })
    @ApiResponse({ status: 404, description: '配置不存在' })
    @ApiQuery({ name: 'uuid', required: true, description: '配置ID' })
    @Delete('delete')
    async deleteReportConfig(@Query('uuid') uuid: string): Promise<Result<void>> {
        await this.reportConfigService.deleteReportConfig(uuid);
        return Result.success();
    }

    @ApiOperation({ summary: '启用/禁用报表配置', description: '切换报表配置的启用状态' })
    @ApiResponse({ status: 200, description: '操作成功' })
    @ApiResponse({ status: 404, description: '配置不存在' })
    @ApiQuery({ name: 'uuid', required: true, description: '配置ID' })
    @ApiQuery({ name: 'isEnabled', required: true, description: '是否启用', example: true })
    @Put('toggle')
    async toggleReportConfig(
        @Query('uuid') uuid: string,
        @Query('isEnabled') isEnabled: string,
    ): Promise<Result<void>> {
        const enabled = isEnabled === 'true' || isEnabled === '1';
        await this.reportConfigService.toggleReportConfig(uuid, enabled);
        return Result.success();
    }

    @ApiOperation({
        summary: '重新加载定时任务',
        description: '重新加载所有报表配置的定时任务（在配置更新后调用）',
    })
    @ApiResponse({ status: 200, description: '重新加载成功' })
    @Post('reload-tasks')
    async reloadTasks(): Promise<Result<void>> {
        await this.tasksService.reloadReportTasks();
        return Result.success();
    }
}
