import { ApiProperty } from '@nestjs/swagger';

export class UserVo {
    @ApiProperty({ description: '用户ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    uuid: string;

    @ApiProperty({ description: '用户代码', example: 'userCode' })
    userCode: string;

    @ApiProperty({ description: '用户名称', example: 'userName' })
    userName: string;

    @ApiProperty({ description: '用户邮箱', example: 'user@example.com' })
    email: string;

    @ApiProperty({ description: '用户手机号', example: '1234567890' })
    phoneNumber: string;

    @ApiProperty({ description: '用户角色名称', example: '管理员' })
    roleName: string;

    @ApiProperty({ description: '用户部门名称', example: '技术部' })
    departmentName: string;

    @ApiProperty({ description: '用户时区', example: 'Asia/Shanghai' })
    timezone: string;

    @ApiProperty({ description: '用户状态', example: 1 })
    status: number;

    @ApiProperty({ description: '创建时间', example: '2022-01-01T00:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ description: '创建人', example: 'admin' })
    createdBy: string;

    @ApiProperty({ description: '更新时间', example: '2022-01-01T00:00:00.000Z' })
    updatedAt: Date;

    @ApiProperty({ description: '更新人', example: 'admin' })
    updatedBy: string;
}
