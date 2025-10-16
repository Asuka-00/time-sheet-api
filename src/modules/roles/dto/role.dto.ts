import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class RoleDto {
    @ApiProperty({ description: '角色ID', required: false })
    @IsOptional()
    uuid?: string;

    @ApiProperty({ description: '角色名称', required: true })
    @IsString()
    name: string;

    @ApiProperty({ description: '角色描述', required: true })
    @IsString()
    description: string;

    @ApiProperty({
        description: '数据范围',
        required: false,
        example: 'ALL',
    })
    @IsOptional()
    @IsString()
    dataScope?: string;

    @ApiProperty({
        description: '权限代码数组',
        required: false,
        example: ['user:create', 'user:update', 'user:delete'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    permissionCodes?: string[];
}
