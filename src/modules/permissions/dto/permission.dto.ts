import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class PermissionDto {
    @ApiProperty({ description: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsOptional()
    uuid?: string;

    @ApiProperty({ description: '权限名称', example: 'name' })
    @IsString()
    name: string;

    @ApiProperty({ description: '菜单显示名称', example: '用户管理', required: false })
    @IsOptional()
    @IsString()
    menuName?: string;

    @ApiProperty({ description: '权限代码', example: 'code' })
    @IsString()
    code: string;

    @ApiProperty({ description: '模块', example: 'module' })
    @IsString()
    module: string;

    @ApiProperty({ description: '权限描述', example: 'description' })
    @IsString()
    description: string;

    @ApiProperty({ description: '状态', example: 1 })
    @IsNumber()
    status: number;

    @ApiProperty({ description: '父级权限代码', example: 'SYSTEM_MENU', required: false })
    @IsOptional()
    @IsString()
    parentCode?: string;

    @ApiProperty({ description: '权限类型', example: 'menu', required: false })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiProperty({ description: '路由路径', example: '/system/user', required: false })
    @IsOptional()
    @IsString()
    path?: string;

    @ApiProperty({ description: '菜单图标', example: 'user', required: false })
    @IsOptional()
    @IsString()
    icon?: string;

    @ApiProperty({ description: '组件路径', example: 'system/user/index', required: false })
    @IsOptional()
    @IsString()
    component?: string;

    @ApiProperty({ description: '排序值', example: 1, required: false })
    @IsOptional()
    @IsNumber()
    sort?: number;
}
