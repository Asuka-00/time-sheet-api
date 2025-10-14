import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(private readonly mailerService: MailerService) {}

    /**
     * 通用邮件发送方法
     */
    async sendMail(to: string, subject: string, template: string, context: any): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to,
                subject,
                template,
                context,
            });
            this.logger.log(`邮件发送成功: ${to} - ${subject}`);
        } catch (error) {
            this.logger.error(`邮件发送失败: ${to} - ${subject}`, error);
            throw error;
        }
    }

    /**
     * 发送带附件的邮件
     * @param to 收件人邮箱（逗号分隔）
     * @param subject 邮件主题
     * @param content 邮件内容
     * @param attachments 附件数组
     */
    async sendMailWithAttachment(
        to: string,
        subject: string,
        content: string,
        attachments: Array<{ filename: string; content: Buffer }>,
    ): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to,
                subject,
                html: content,
                attachments: attachments.map((att) => ({
                    filename: att.filename,
                    content: att.content,
                })),
            });
            this.logger.log(`带附件的邮件发送成功: ${to} - ${subject}`);
        } catch (error) {
            this.logger.error(`带附件的邮件发送失败: ${to} - ${subject}`, error);
            throw error;
        }
    }
}
