import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class DepartmentDto {
    @ApiProperty({ description: '部门ID', required: false })
    @IsOptional()
    uuid?: string;

    @ApiProperty({ description: '部门名称', required: true })
    @IsString()
    name: string;

    @ApiProperty({ description: '部门描述', required: true })
    @IsString()
    description: string;

    @ApiProperty({ description: '上级部门名称', required: false })
    @IsOptional()
    @IsString()
    parentDepartmentName?: string;

    @ApiProperty({ description: '状态', required: false })
    @IsOptional()
    @IsNumber()
    status?: number;
}
