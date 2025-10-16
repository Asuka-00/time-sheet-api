import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { UserModule } from '../users/user.module';
import { RoleModule } from '../roles/role.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Project, ProjectMember]),
        forwardRef(() => UserModule),
        forwardRef(() => RoleModule),
    ],
    controllers: [ProjectController],
    providers: [ProjectService],
    exports: [ProjectService],
})
export class ProjectModule {}
