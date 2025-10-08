import { ApiProperty } from '@nestjs/swagger';

export class PermissionVo {
    @ApiProperty({ description: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' })
    uuid: string;
    @ApiProperty({ description: '权限名称', example: 'name' })
    name: string;
    @ApiProperty({ description: '菜单显示名称', example: '用户管理', required: false })
    menuName?: string;
    @ApiProperty({ description: '权限代码', example: 'code' })
    code: string;
    @ApiProperty({ description: '模块', example: 'module' })
    module: string;
    @ApiProperty({ description: '权限描述', example: 'description' })
    description: string;
    @ApiProperty({ description: '状态', example: 1 })
    status: number;
    @ApiProperty({ description: '父级权限代码', example: 'SYSTEM_MENU', required: false })
    parentCode?: string;
    @ApiProperty({ description: '权限类型', example: 'menu' })
    type: string;
    @ApiProperty({ description: '路由路径', example: '/system/user', required: false })
    path?: string;
    @ApiProperty({ description: '菜单图标', example: 'user', required: false })
    icon?: string;
    @ApiProperty({ description: '组件路径', example: 'system/user/index', required: false })
    component?: string;
    @ApiProperty({ description: '排序值', example: 1 })
    sort: number;
    @ApiProperty({ description: '子权限列表', type: () => [PermissionVo], required: false })
    children?: PermissionVo[];
    @ApiProperty({ description: '创建时间', example: '2022-01-01T00:00:00.000Z' })
    createdAt: Date;
    @ApiProperty({ description: '创建人', example: 'createdBy' })
    createdBy: string;
    @ApiProperty({ description: '更新时间', example: '2022-01-01T00:00:00.000Z' })
    updatedAt: Date;
    @ApiProperty({ description: '更新人', example: 'updatedBy' })
    updatedBy: string;
}
