import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/users/user.module';
import { RoleModule } from './modules/roles/role.module';
import { PermissionModule } from './modules/permissions/permission.module';
import { DepartmentModule } from './modules/departments/department.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectModule } from './modules/projects/project.module';
import { TimesheetModule } from './modules/timesheets/timesheet.module';
import { RequestContextService } from './common/context/request-context.service';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor';
import { getDatabaseConfig } from './config/database.config';

@Module({
    imports: [
        // 配置模块 - 加载环境变量
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        // TypeORM 配置 - 支持多种数据库 (MySQL, PostgreSQL, Oracle, SQLite)
        // 数据库类型通过环境变量 DB_TYPE 配置
        TypeOrmModule.forRoot(getDatabaseConfig()),
        // 业务模块
        UserModule,
        RoleModule,
        PermissionModule,
        DepartmentModule,
        AuthModule,
        ProjectModule,
        TimesheetModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        RequestContextService,
        // 配置全局JWT认证守卫
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        // 配置全局请求上下文拦截器
        {
            provide: APP_INTERCEPTOR,
            useClass: RequestContextInterceptor,
        },
    ],
})
export class AppModule {}
