import { ApiProperty } from '@nestjs/swagger';

export class RoleVo {
    @ApiProperty({ description: '角色ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    uuid: string;

    @ApiProperty({ description: '角色名称', example: '管理员' })
    name: string;

    @ApiProperty({ description: '角色描述', example: '系统管理员角色' })
    description: string;

    @ApiProperty({ description: '创建时间', example: '2022-01-01T00:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ description: '创建人', example: 'admin' })
    createdBy: string;

    @ApiProperty({ description: '更新时间', example: '2022-01-01T00:00:00.000Z' })
    updatedAt: Date;

    @ApiProperty({ description: '更新人', example: 'admin' })
    updatedBy: string;
}
