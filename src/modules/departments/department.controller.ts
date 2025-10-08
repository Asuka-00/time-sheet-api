import { Body, Controller, Delete, Get, Post, Put, Query } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentDto } from './dto/department.dto';
import { DepartmentVo } from './dto/department.vo';
import { PageResult, Result } from 'src/common';

@ApiTags('部门管理')
@ApiBearerAuth()
@Controller('department')
export class DepartmentController {
    constructor(private readonly departmentService: DepartmentService) {}

    @ApiOperation({ summary: '新增部门', description: '创建一个新的部门，需要提供部门名称和描述' })
    @ApiResponse({ status: 200, description: '创建成功' })
    @ApiResponse({ status: 400, description: '部门已存在' })
    @Post('create')
    async createDepartment(@Body() departmentDto: DepartmentDto): Promise<Result<void>> {
        await this.departmentService.createDepartment(departmentDto);
        return Result.success();
    }

    @ApiOperation({
        summary: '分页获取部门列表',
        description: '支持按部门名称、描述搜索的分页查询',
    })
    @ApiResponse({ status: 200, description: '查询成功，返回分页数据' })
    @ApiResponse({ status: 400, description: '参数错误' })
    @ApiQuery({ name: 'current', required: false, description: '当前页码，默认为1', example: 1 })
    @ApiQuery({ name: 'size', required: false, description: '每页大小，默认为10', example: 10 })
    @ApiQuery({
        name: 'searchKey',
        required: false,
        description: '搜索关键字（部门名称或描述）',
        example: '技术部',
    })
    @Get('list')
    async getDepartmentList(
        @Query('current') current: number = 1,
        @Query('size') size: number = 10,
        @Query('searchKey') searchKey?: string,
    ): Promise<Result<PageResult<DepartmentVo>>> {
        const pageNum = Number(current) || 1;
        const pageSize = Number(size) || 10;
        const { records, total } = await this.departmentService.getDepartmentList(
            pageNum,
            pageSize,
            searchKey,
        );
        return Result.page(records, total, pageNum, pageSize);
    }

    @ApiOperation({ summary: '删除部门', description: '根据部门ID删除指定部门' })
    @ApiResponse({ status: 200, description: '删除成功' })
    @ApiResponse({ status: 404, description: '部门不存在' })
    @ApiQuery({ name: 'uuid', required: true, description: '部门ID', example: 'abc-123-def' })
    @Delete('delete')
    async deleteDepartment(@Query('uuid') uuid: string): Promise<Result<void>> {
        await this.departmentService.deleteDepartment(uuid);
        return Result.success();
    }

    @ApiOperation({ summary: '更新部门', description: '更新指定部门信息' })
    @ApiResponse({ status: 200, description: '更新成功' })
    @ApiResponse({ status: 404, description: '部门不存在' })
    @Put('update')
    async updateDepartment(@Body() departmentDto: DepartmentDto): Promise<Result<void>> {
        await this.departmentService.updateDepartment(departmentDto);
        return Result.success();
    }

    @ApiOperation({ summary: '查询部门', description: '根据部门ID查询指定部门信息' })
    @ApiResponse({ status: 200, description: '查询成功' })
    @ApiResponse({ status: 404, description: '部门不存在' })
    @ApiQuery({ name: 'uuid', required: false, description: '部门ID', example: 'abc-123-def' })
    @Get('get')
    async getDepartment(@Query('uuid') uuid?: string): Promise<Result<DepartmentVo[]>> {
        const department = await this.departmentService.getDepartment(uuid);
        return Result.success(department);
    }
}
