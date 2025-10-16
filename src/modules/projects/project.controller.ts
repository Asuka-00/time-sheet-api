import { Body, Controller, Delete, Get, Post, Put, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectDto } from './dto/project.dto';
import { ProjectVo } from './dto/project.vo';
import { ProjectMemberDto } from './dto/project-member.dto';
import { ProjectMemberVo } from './dto/project-member.vo';
import { PageResult, Result } from 'src/common';
import { RequestContextService } from 'src/common/context/request-context.service';

@ApiTags('项目管理')
@ApiBearerAuth()
@Controller('project')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) {}

    @ApiOperation({ summary: '创建项目', description: '创建新项目，需要指定项目经理' })
    @ApiResponse({ status: 200, description: '创建成功' })
    @ApiResponse({ status: 400, description: '项目编码已存在' })
    @Post('create')
    async createProject(@Body() projectDto: ProjectDto): Promise<Result<void>> {
        await this.projectService.createProject(projectDto);
        return Result.success();
    }

    @ApiOperation({
        summary: '分页获取项目列表',
        description: '支持按项目编码、项目名称搜索的分页查询',
    })
    @ApiResponse({ status: 200, description: '查询成功，返回分页数据' })
    @ApiResponse({ status: 400, description: '参数错误' })
    @ApiQuery({ name: 'current', required: false, description: '当前页码，默认为1', example: 1 })
    @ApiQuery({ name: 'size', required: false, description: '每页大小，默认为10', example: 10 })
    @ApiQuery({
        name: 'searchKey',
        required: false,
        description: '搜索关键字（项目编码或项目名称）',
        example: 'PRJ001',
    })
    @Get('list')
    async getProjectList(
        @Query('current') current: number = 1,
        @Query('size') size: number = 10,
        @Query('searchKey') searchKey?: string,
    ): Promise<Result<PageResult<ProjectVo>>> {
        const pageNum = Number(current) || 1;
        const pageSize = Number(size) || 10;
        const userCode = RequestContextService.getCurrentUserCode();
        const { records, total } = await this.projectService.getProjectList(
            pageNum,
            pageSize,
            searchKey,
            userCode,
        );
        return Result.page(records, total, pageNum, pageSize);
    }

    @ApiOperation({ summary: '查询项目', description: '根据项目ID查询指定项目信息' })
    @ApiResponse({ status: 200, description: '查询成功' })
    @ApiResponse({ status: 404, description: '项目不存在' })
    @ApiQuery({ name: 'uuid', required: false, description: '项目ID', example: 'abc-123-def' })
    @Get('get')
    async getProject(@Query('uuid') uuid?: string): Promise<Result<ProjectVo[]>> {
        const project = await this.projectService.getProject(uuid);
        return Result.success(project);
    }

    @ApiOperation({ summary: '更新项目', description: '更新指定项目信息' })
    @ApiResponse({ status: 200, description: '更新成功' })
    @ApiResponse({ status: 404, description: '项目不存在' })
    @Put('update')
    async updateProject(@Body() projectDto: ProjectDto): Promise<Result<void>> {
        await this.projectService.updateProject(projectDto);
        return Result.success();
    }

    @ApiOperation({
        summary: '删除项目',
        description: '根据项目ID删除指定项目，会级联删除项目成员',
    })
    @ApiResponse({ status: 200, description: '删除成功' })
    @ApiResponse({ status: 404, description: '项目不存在' })
    @ApiQuery({ name: 'uuid', required: true, description: '项目ID', example: 'abc-123-def' })
    @Delete('delete')
    async deleteProject(@Query('uuid') uuid: string): Promise<Result<void>> {
        await this.projectService.deleteProject(uuid);
        return Result.success();
    }

    @ApiOperation({ summary: '添加项目成员', description: '为指定项目添加成员' })
    @ApiResponse({ status: 200, description: '添加成功' })
    @ApiResponse({ status: 400, description: '该用户已是项目成员' })
    @ApiResponse({ status: 404, description: '项目或用户不存在' })
    @Post('member/add')
    async addProjectMember(@Body() memberDto: ProjectMemberDto): Promise<Result<void>> {
        await this.projectService.addProjectMember(memberDto);
        return Result.success();
    }

    @ApiOperation({ summary: '移除项目成员', description: '根据项目成员ID移除成员' })
    @ApiResponse({ status: 200, description: '移除成功' })
    @ApiQuery({ name: 'uuid', required: true, description: '项目成员ID', example: 'abc-123-def' })
    @Delete('member/remove')
    async removeProjectMember(@Query('uuid') uuid: string): Promise<Result<void>> {
        await this.projectService.removeProjectMember(uuid);
        return Result.success();
    }

    @ApiOperation({ summary: '查询项目成员列表', description: '根据项目UUID查询所有项目成员' })
    @ApiResponse({ status: 200, description: '查询成功' })
    @ApiQuery({
        name: 'projectName',
        required: true,
        description: '项目UUID',
        example: 'abc-123-def',
    })
    @Get('member/list')
    async getProjectMembers(
        @Query('projectName') projectName: string,
    ): Promise<Result<ProjectMemberVo[]>> {
        const members = await this.projectService.getProjectMembers(projectName);
        return Result.success(members);
    }

    @ApiOperation({
        summary: '查询我的项目',
        description: '查询当前用户参与的所有项目（包括作为项目经理和项目成员的项目）',
    })
    @ApiResponse({ status: 200, description: '查询成功' })
    @Get('my-projects')
    async getMyProjects(): Promise<Result<ProjectVo[]>> {
        const userCode = RequestContextService.getCurrentUserCode();
        if (!userCode) {
            return Result.success([]);
        }
        const projects = await this.projectService.getUserProjects(userCode);
        return Result.success(projects);
    }
}
