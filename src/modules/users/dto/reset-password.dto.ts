import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { VALIDATION_CODES } from 'src/common';

/**
 * 重置密码请求DTO
 */
export class ResetPasswordDto {
    @ApiProperty({ description: '用户ID', example: 'abc-123-def', required: true })
    @IsString()
    uuid: string;

    @ApiProperty({ description: '新密码', example: 'newpassword123', required: true })
    @IsString()
    @MinLength(6, { message: VALIDATION_CODES.PASSWORD.MIN_LENGTH })
    newPassword: string;
}
