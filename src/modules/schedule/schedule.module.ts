import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import { ReportConfigModule } from '../report-config/report-config.module';
import { ExcelModule } from '../excel/excel.module';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [
        NestScheduleModule.forRoot(),
        forwardRef(() => ReportConfigModule),
        ExcelModule,
        MailModule,
    ],
    providers: [TasksService],
    exports: [TasksService],
})
export class ScheduleModule {}
