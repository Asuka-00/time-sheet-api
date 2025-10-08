import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { initializeTransactionalContext, addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';

async function bootstrap() {
    // 初始化事务上下文
    initializeTransactionalContext();

    const app = await NestFactory.create(AppModule);

    // 配置 CORS（跨域资源共享）
    const corsOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*';
    const corsCredentials = process.env.CORS_CREDENTIALS === 'true';

    app.enableCors({
        origin: corsOrigin,
        credentials: corsCredentials,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        maxAge: 3600,
    });

    // 注册全局异常过滤器
    app.useGlobalFilters(new HttpExceptionFilter());

    // 注册全局验证管道
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // 自动删除非白名单属性
            forbidNonWhitelisted: true, // 存在非白名单属性时抛出异常
            transform: true, // 自动转换类型
        }),
    );

    // 配置 Swagger 文档
    const config = new DocumentBuilder()
        .setTitle('Time Sheet API')
        .setDescription('项目工时管理系统 API 文档')
        .setVersion('1.0')
        .addBearerAuth() // 使用默认Bearer认证配置
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // 注册事务数据源
    const dataSource = app.get(DataSource);
    addTransactionalDataSource(dataSource);

    await app.listen(process.env.PORT ?? 3000);
    console.warn(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
    console.warn(`Swagger documentation: http://localhost:${process.env.PORT ?? 3000}/api`);
}
void bootstrap();
