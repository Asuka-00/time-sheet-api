import { Body, Controller, Delete, Get, Post, Put, Query } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ApiOperation, ApiResponse, ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionDto } from './dto/permission.dto';
import { PermissionVo } from './dto/permission.vo';
import { PageResult, Result } from 'src/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserService } from '../users/user.service';

@ApiTags('权限管理')
@ApiBearerAuth()
@Controller('permission')
export class PermissionController {
    constructor(
        private readonly permissionService: PermissionService,
        private readonly userService: UserService,
    ) {}

    @ApiOperation({
        summary: '新增权限',
        description: '创建一个新的权限，需要提供权限名称、代码、模块、描述和状态',
    })
    @ApiResponse({ status: 200, description: '创建成功' })
    @ApiResponse({ status: 400, description: '权限代码已存在' })
    @Post('create')
    async createPermission(@Body() permissionDto: PermissionDto): Promise<Result<void>> {
        await this.permissionService.createPermission(permissionDto);
        return Result.success();
    }

    @ApiOperation({
        summary: '分页获取权限列表',
        description: '支持按权限名称、代码搜索的分页查询',
    })
    @ApiResponse({ status: 200, description: '查询成功，返回分页数据' })
    @ApiResponse({ status: 400, description: '参数错误' })
    @ApiQuery({ name: 'current', required: false, description: '当前页码，默认为1', example: 1 })
    @ApiQuery({ name: 'size', required: false, description: '每页大小，默认为10', example: 10 })
    @ApiQuery({
        name: 'searchKey',
        required: false,
        description: '搜索关键字（权限名称或代码）',
        example: '用户管理',
    })
    @Get('list')
    async getPermissionList(
        @Query('current') current: number = 1,
        @Query('size') size: number = 10,
        @Query('searchKey') searchKey?: string,
    ): Promise<Result<PageResult<PermissionVo>>> {
        const pageNum = Number(current) || 1;
        const pageSize = Number(size) || 10;
        const { records, total } = await this.permissionService.getPermissionList(
            pageNum,
            pageSize,
            searchKey,
        );
        return Result.page(records, total, pageNum, pageSize);
    }

    @ApiOperation({ summary: '删除权限', description: '根据权限ID删除指定权限' })
    @ApiResponse({ status: 200, description: '删除成功' })
    @ApiResponse({ status: 404, description: '权限不存在' })
    @ApiQuery({ name: 'uuid', required: true, description: '权限ID', example: 'abc-123-def' })
    @Delete('delete')
    async deletePermission(@Query('uuid') uuid: string): Promise<Result<void>> {
        await this.permissionService.deletePermission(uuid);
        return Result.success();
    }

    @ApiOperation({ summary: '更新权限', description: '更新指定权限信息' })
    @ApiResponse({ status: 200, description: '更新成功' })
    @ApiResponse({ status: 404, description: '权限不存在' })
    @Put('update')
    async updatePermission(@Body() permissionDto: PermissionDto): Promise<Result<void>> {
        await this.permissionService.updatePermission(permissionDto);
        return Result.success();
    }

    @ApiOperation({ summary: '查询权限', description: '根据权限ID查询指定权限信息' })
    @ApiResponse({ status: 200, description: '查询成功' })
    @ApiResponse({ status: 404, description: '权限不存在' })
    @ApiQuery({ name: 'uuid', required: false, description: '权限ID', example: 'abc-123-def' })
    @Get('get')
    async getPermission(@Query('uuid') uuid?: string): Promise<Result<PermissionVo[]>> {
        const permission = await this.permissionService.getPermission(uuid);
        return Result.success(permission);
    }

    @ApiOperation({
        summary: '获取树形权限列表',
        description: '获取完整的树形结构权限列表，用于菜单渲染',
    })
    @ApiResponse({ status: 200, description: '查询成功，返回树形结构' })
    @Get('tree')
    async getPermissionTree(): Promise<Result<PermissionVo[]>> {
        const tree = await this.permissionService.getPermissionTree();
        return Result.success(tree);
    }

    @ApiOperation({
        summary: '获取子权限树',
        description: '根据父级权限代码获取其下的子权限树',
    })
    @ApiResponse({ status: 200, description: '查询成功' })
    @ApiQuery({
        name: 'parentCode',
        required: true,
        description: '父级权限代码',
        example: 'SYSTEM_MENU',
    })
    @Get('subtree')
    async getPermissionSubTree(
        @Query('parentCode') parentCode: string,
    ): Promise<Result<PermissionVo[]>> {
        const subTree = await this.permissionService.getPermissionSubTree(parentCode);
        return Result.success(subTree);
    }

    @ApiOperation({
        summary: '获取当前用户权限菜单',
        description: '根据当前登录用户的角色权限，返回其可访问的菜单树',
    })
    @ApiResponse({ status: 200, description: '查询成功，返回用户权限菜单树' })
    @Get('user-menu')
    async getUserPermissionMenu(
        @CurrentUser('userCode') userCode: string,
    ): Promise<Result<PermissionVo[]>> {
        // 获取用户所有权限代码
        const permissionCodes = await this.userService.getUserAllPermissions(userCode);

        // 根据权限代码获取权限菜单树
        const menuTree = await this.permissionService.getUserPermissionTree(permissionCodes);

        return Result.success(menuTree);
    }
}
