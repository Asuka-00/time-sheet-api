import { Module } from '@nestjs/common';
import ExcelService from './excel.service';
import { TimesheetModule } from '../timesheets/timesheet.module';
import { ProjectModule } from '../projects/project.module';
import { UserModule } from '../users/user.module';

@Module({
    imports: [TimesheetModule, ProjectModule, UserModule],
    providers: [ExcelService],
    exports: [ExcelService],
})
export class ExcelModule {}
