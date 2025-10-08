import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class AssignPermissionsDto {
    @ApiProperty({ description: '角色名称', required: true, example: '管理员' })
    @IsString()
    roleName: string;

    @ApiProperty({
        description: '权限代码数组',
        required: true,
        example: ['user:create', 'user:update', 'user:delete'],
        type: [String],
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    permissionCodes: string[];
}
