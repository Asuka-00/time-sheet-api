import { Body, Controller, Delete, Get, Post, Put, Query, Param } from '@nestjs/common';
import { RoleService } from './role.service';
import {
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiTags,
    ApiParam,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { RoleDto } from './dto/role.dto';
import { RoleVo } from './dto/role.vo';
import { PageResult, Result } from 'src/common';

@ApiTags('角色管理')
@ApiBearerAuth()
@Controller('role')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @ApiOperation({ summary: '新增角色', description: '创建一个新的角色，需要提供角色名称和描述' })
    @ApiResponse({ status: 200, description: '创建成功' })
    @ApiResponse({ status: 400, description: '角色已存在' })
    @Post('create')
    async createRole(@Body() roleDto: RoleDto): Promise<Result<void>> {
        await this.roleService.createRole(roleDto);
        return Result.success();
    }

    @ApiOperation({ summary: '分页获取角色列表', description: '支持按角色名称搜索的分页查询' })
    @ApiResponse({ status: 200, description: '查询成功，返回分页数据' })
    @ApiResponse({ status: 400, description: '参数错误' })
    @ApiQuery({ name: 'current', required: false, description: '当前页码，默认为1', example: 1 })
    @ApiQuery({ name: 'size', required: false, description: '每页大小，默认为10', example: 10 })
    @ApiQuery({
        name: 'searchKey',
        required: false,
        description: '搜索关键字（角色名称）',
        example: '管理员',
    })
    @Get('list')
    async getRoleList(
        @Query('current') current: number = 1,
        @Query('size') size: number = 10,
        @Query('searchKey') searchKey?: string,
    ): Promise<Result<PageResult<RoleVo>>> {
        const pageNum = Number(current) || 1;
        const pageSize = Number(size) || 10;
        const { records, total } = await this.roleService.getRoleList(pageNum, pageSize, searchKey);
        return Result.page(records, total, pageNum, pageSize);
    }

    @ApiOperation({ summary: '删除角色', description: '根据角色ID删除指定角色' })
    @ApiResponse({ status: 200, description: '删除成功' })
    @ApiResponse({ status: 404, description: '角色不存在' })
    @ApiQuery({ name: 'uuid', required: true, description: '角色ID', example: 'abc-123-def' })
    @Delete('delete')
    async deleteRole(@Query('uuid') uuid: string): Promise<Result<void>> {
        await this.roleService.deleteRole(uuid);
        return Result.success();
    }

    @ApiOperation({ summary: '更新角色', description: '更新指定角色信息' })
    @ApiResponse({ status: 200, description: '更新成功' })
    @ApiResponse({ status: 404, description: '角色不存在' })
    @Put('update')
    async updateRole(@Body() roleDto: RoleDto): Promise<Result<void>> {
        await this.roleService.updateRole(roleDto);
        return Result.success();
    }

    @ApiOperation({ summary: '查询角色', description: '根据角色ID查询指定角色信息' })
    @ApiResponse({ status: 200, description: '查询成功' })
    @ApiResponse({ status: 404, description: '角色不存在' })
    @ApiQuery({ name: 'uuid', required: false, description: '角色ID', example: 'abc-123-def' })
    @Get('get')
    async getRole(@Query('uuid') uuid?: string): Promise<Result<RoleVo[]>> {
        const role = await this.roleService.getRole(uuid);
        return Result.success(role);
    }

    @ApiOperation({ summary: '查询角色权限', description: '查询指定角色拥有的所有权限代码' })
    @ApiResponse({ status: 200, description: '查询成功，返回权限代码数组' })
    @ApiParam({ name: 'roleName', description: '角色名称', example: '管理员' })
    @Get('permissions/:roleName')
    async getPermissions(@Param('roleName') roleName: string): Promise<Result<string[]>> {
        const permissions = await this.roleService.getPermissionsByRoleName(roleName);
        return Result.success(permissions);
    }
}
