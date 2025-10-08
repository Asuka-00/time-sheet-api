import { Controller, Delete, Get, Post, Put, Query, Body } from '@nestjs/common';
import { Result, PageResult, SUCCESS_CODES } from '../../common';
import { UserDto } from './dto/user.dto';
import { UserVo } from './dto/user.vo';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserService } from './user.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('用户管理')
@ApiBearerAuth()
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @ApiOperation({ summary: '创建用户', description: '创建新用户' })
    @ApiResponse({ status: 200, description: '创建成功' })
    @ApiResponse({ status: 400, description: '参数错误' })
    @Post('create')
    async createUser(@Body() userDto: UserDto): Promise<Result<void>> {
        await this.userService.createUser(userDto);
        return Result.success();
    }

    @ApiOperation({ summary: '分页查询用户列表', description: '支持按用户名称搜索的分页查询' })
    @ApiResponse({ status: 200, description: '查询成功，返回分页数据' })
    @ApiResponse({ status: 400, description: '参数错误' })
    @ApiQuery({ name: 'current', required: false, description: '当前页码，默认为1', example: 1 })
    @ApiQuery({ name: 'size', required: false, description: '每页大小，默认为10', example: 10 })
    @ApiQuery({
        name: 'searchKey',
        required: false,
        description: '搜索关键字（用户名称）',
        example: '张三',
    })
    @Get('list')
    async getUsers(
        @Query('current') current: number = 1,
        @Query('size') size: number = 10,
        @Query('searchKey') searchKey?: string,
    ): Promise<Result<PageResult<UserVo>>> {
        const pageNum = Number(current) || 1;
        const pageSize = Number(size) || 10;
        const { records, total } = await this.userService.getUserList(pageNum, pageSize, searchKey);
        return Result.page(records, total, pageNum, pageSize);
    }

    @ApiOperation({ summary: '删除用户', description: '根据用户ID删除指定用户' })
    @ApiResponse({ status: 200, description: '删除成功' })
    @ApiResponse({ status: 404, description: '用户不存在' })
    @ApiQuery({ name: 'uuid', required: true, description: '用户ID', example: 'abc-123-def' })
    @Delete('delete')
    async deleteUser(@Query('uuid') uuid: string): Promise<Result<void>> {
        await this.userService.deleteUser(uuid);
        return Result.success();
    }

    @ApiOperation({ summary: '更新用户', description: '更新指定用户信息' })
    @ApiResponse({ status: 200, description: '更新成功' })
    @ApiResponse({ status: 404, description: '用户不存在' })
    @Put('update')
    async updateUser(@Body() userDto: UserDto): Promise<Result<void>> {
        await this.userService.updateUser(userDto);
        return Result.success();
    }

    @ApiOperation({ summary: '查询用户', description: '根据用户ID查询指定用户信息' })
    @ApiResponse({ status: 200, description: '查询成功' })
    @ApiResponse({ status: 404, description: '用户不存在' })
    @ApiQuery({ name: 'uuid', required: false, description: '用户ID', example: 'abc-123-def' })
    @Get('get')
    async getUser(@Query('uuid') uuid?: string): Promise<Result<UserVo[]>> {
        const user = await this.userService.getUser(uuid);
        return Result.success(user);
    }

    @ApiOperation({ summary: '重置用户密码', description: '管理员重置指定用户的密码' })
    @ApiResponse({ status: 200, description: '重置成功' })
    @ApiResponse({ status: 404, description: '用户不存在' })
    @ApiResponse({ status: 400, description: '参数错误' })
    @Put('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<Result<void>> {
        await this.userService.resetPassword(resetPasswordDto.uuid, resetPasswordDto.newPassword);
        return Result.success(undefined, SUCCESS_CODES.USER.RESET_PASSWORD_SUCCESS);
    }

    @ApiOperation({ summary: '修改密码', description: '用户修改自己的密码' })
    @ApiResponse({ status: 200, description: '修改成功' })
    @ApiResponse({ status: 400, description: '参数错误或旧密码错误' })
    @ApiResponse({ status: 401, description: '未授权' })
    @ApiResponse({ status: 404, description: '用户不存在' })
    @Put('change-password')
    async changePassword(
        @Body() changePasswordDto: ChangePasswordDto,
        @CurrentUser('userCode') userCode: string,
    ): Promise<Result<void>> {
        // 验证新密码与确认密码是否一致
        if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
            return Result.error('新密码与确认密码不一致', 400);
        }

        // 调用service层修改密码
        await this.userService.changePassword(
            userCode,
            changePasswordDto.oldPassword,
            changePasswordDto.newPassword,
        );

        return Result.success(undefined, SUCCESS_CODES.USER.CHANGE_PASSWORD_SUCCESS);
    }
}
