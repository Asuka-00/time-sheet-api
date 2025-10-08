import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { VALIDATION_CODES } from 'src/common';

/**
 * 修改密码请求DTO
 */
export class ChangePasswordDto {
    @ApiProperty({ description: '旧密码', example: 'oldpassword123', required: true })
    @IsNotEmpty({ message: VALIDATION_CODES.PASSWORD.OLD_PASSWORD_REQUIRED })
    @IsString()
    oldPassword: string;

    @ApiProperty({ description: '新密码', example: 'newpassword123', required: true })
    @IsNotEmpty({ message: VALIDATION_CODES.PASSWORD.NEW_PASSWORD_REQUIRED })
    @IsString()
    @MinLength(6, { message: VALIDATION_CODES.PASSWORD.MIN_LENGTH })
    newPassword: string;

    @ApiProperty({ description: '确认新密码', example: 'newpassword123', required: true })
    @IsNotEmpty({ message: VALIDATION_CODES.PASSWORD.CONFIRM_PASSWORD_REQUIRED })
    @IsString()
    @MinLength(6, { message: VALIDATION_CODES.PASSWORD.MIN_LENGTH })
    confirmPassword: string;
}
