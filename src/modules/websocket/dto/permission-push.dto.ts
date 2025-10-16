import { ApiProperty } from '@nestjs/swagger';
import { PermissionVo } from '../../permissions/dto/permission.vo';

/**
 * 权限推送DTO
 * 用于WebSocket推送权限数据给客户端
 */
export class PermissionPushDto {
    @ApiProperty({
        description: '用户权限菜单树',
        type: [PermissionVo],
    })
    permissions: PermissionVo[];

    @ApiProperty({
        description: '用户按钮权限代码数组',
        type: [String],
        example: ['button:user:create', 'button:user:edit'],
    })
    buttonPermissions: string[];

    @ApiProperty({
        description: '推送时间戳',
        example: 1697461234567,
    })
    timestamp: number;
}
