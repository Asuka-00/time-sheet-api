import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Timesheet } from './entities/timesheet.entity';
import { TimesheetController } from './timesheet.controller';
import { TimesheetService } from './timesheet.service';
import { ProjectModule } from '../projects/project.module';
import { UserModule } from '../users/user.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Timesheet]),
        forwardRef(() => ProjectModule),
        forwardRef(() => UserModule),
    ],
    controllers: [TimesheetController],
    providers: [TimesheetService],
    exports: [TimesheetService],
})
export class TimesheetModule {}
