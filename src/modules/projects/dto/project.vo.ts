import { ApiProperty } from '@nestjs/swagger';
import { Project } from '../entities/project.entity';

export class ProjectVo extends Project {
    @ApiProperty({ description: '项目经理姓名', required: false })
    managerUserName?: string;

    @ApiProperty({ description: '项目成员数量', required: false })
    memberCount?: number;
}
