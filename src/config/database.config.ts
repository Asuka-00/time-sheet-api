import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuditSubscriber } from '../common/subscribers/audit.subscriber';

/**
 * 获取数据库配置
 * 根据环境变量 DB_TYPE 返回对应的数据库配置
 * 支持: mysql, postgres, oracle, sqlite
 */
export const getDatabaseConfig = (): TypeOrmModuleOptions => {
    const dbType = process.env.DB_TYPE || 'sqlite';

    // 通用配置
    const baseConfig = {
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        subscribers: [AuditSubscriber],
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
        logging: process.env.DB_LOGGING === 'true',
    };

    // 根据数据库类型返回配置
    switch (dbType.toLowerCase()) {
        case 'mysql':
            return {
                ...baseConfig,
                type: 'mysql',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '3306', 10),
                username: process.env.DB_USERNAME || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_DATABASE || 'timesheet',
                charset: 'utf8mb4',
                extra: {
                    charset: 'utf8mb4_unicode_ci',
                },
            } as TypeOrmModuleOptions;

        case 'postgres':
        case 'postgresql':
            return {
                ...baseConfig,
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432', 10),
                username: process.env.DB_USERNAME || 'postgres',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_DATABASE || 'timesheet',
            } as TypeOrmModuleOptions;

        case 'oracle':
            return {
                ...baseConfig,
                type: 'oracle',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '1521', 10),
                username: process.env.DB_USERNAME || 'system',
                password: process.env.DB_PASSWORD || '',
                sid: process.env.DB_DATABASE || 'xe',
            } as TypeOrmModuleOptions;

        case 'sqlite':
        default:
            return {
                ...baseConfig,
                type: 'sqlite',
                database: process.env.DATABASE_PATH || './database.sqlite',
            } as TypeOrmModuleOptions;
    }
};
