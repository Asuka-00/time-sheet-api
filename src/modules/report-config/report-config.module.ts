import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportConfig } from './entities/report-config.entity';
import { ReportConfigController } from './report-config.controller';
import { ReportConfigService } from './report-config.service';
import { ScheduleModule } from '../schedule/schedule.module';

@Module({
    imports: [TypeOrmModule.forFeature([ReportConfig]), forwardRef(() => ScheduleModule)],
    controllers: [ReportConfigController],
    providers: [ReportConfigService],
    exports: [ReportConfigService],
})
export class ReportConfigModule {}
