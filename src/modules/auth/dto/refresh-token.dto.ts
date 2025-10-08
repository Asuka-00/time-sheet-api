import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * 刷新令牌请求DTO
 */
export class RefreshTokenDto {
    @ApiProperty({ description: '刷新令牌', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    @IsString()
    refreshToken: string;
}
