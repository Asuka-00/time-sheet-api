import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    host: configService.get<string>('MAIL_HOST', 'smtp.example.com'),
                    port: configService.get<number>('MAIL_PORT', 587),
                    secure: configService.get<string>('MAIL_SECURE') === 'true',
                    auth: {
                        user: configService.get<string>('MAIL_USER', ''),
                        pass: configService.get<string>('MAIL_PASSWORD', ''),
                    },
                },
                defaults: {
                    from: configService.get<string>(
                        'MAIL_FROM',
                        '"No Reply" <noreply@example.com>',
                    ),
                },
                template: {
                    dir: join(__dirname, 'templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
