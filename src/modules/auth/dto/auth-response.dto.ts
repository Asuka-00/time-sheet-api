import { ApiProperty } from '@nestjs/swagger';
import { PermissionVo } from '../../permissions/dto/permission.vo';

/**
 * 用户信息DTO（不包含敏感信息）
 */
export class UserInfoDto {
    @ApiProperty({ description: '用户UUID' })
    uuid: string;

    @ApiProperty({ description: '用户编码' })
    userCode: string;

    @ApiProperty({ description: '用户名称' })
    userName: string;

    @ApiProperty({ description: '邮箱' })
    email: string;

    @ApiProperty({ description: '角色名称', required: false })
    roleName?: string;

    @ApiProperty({ description: '部门名称', required: false })
    departmentName?: string;

    @ApiProperty({ description: '用户时区', required: false, example: 'Asia/Shanghai' })
    timezone?: string;

    @ApiProperty({ description: '用户状态' })
    status: number;
}

/**
 * 认证响应DTO
 */
export class AuthResponseDto {
    @ApiProperty({ description: '访问令牌（短期有效）' })
    accessToken: string;

    @ApiProperty({ description: '刷新令牌（长期有效）' })
    refreshToken: string;

    @ApiProperty({ description: '用户信息', type: UserInfoDto })
    user: UserInfoDto;

    @ApiProperty({
        description: '用户权限菜单树',
        type: [PermissionVo],
        required: false,
    })
    permissions?: PermissionVo[];

    @ApiProperty({
        description: '用户按钮权限代码数组',
        type: [String],
        required: false,
        example: ['button:user:create', 'button:user:edit'],
    })
    buttonPermissions?: string[];
}
