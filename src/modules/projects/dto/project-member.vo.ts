import { ApiProperty } from '@nestjs/swagger';
import { ProjectMember } from '../entities/project-member.entity';

export class ProjectMemberVo extends ProjectMember {
    @ApiProperty({ description: '成员姓名', required: false })
    userName?: string;

    @ApiProperty({ description: '成员邮箱', required: false })
    email?: string;
}
