import {Injectable} from "@nestjs/common";
import {MailerService} from "@nestjs-modules/mailer";
import {ConfigService} from "@nestjs/config";
import {SentMessageInfo} from "nodemailer";

@Injectable()
export class NotificationsService {
    constructor(private readonly mailerService: MailerService, private readonly configService: ConfigService) {
    }

    async sendResetPasswordEmail(email: string, link: string): Promise<SentMessageInfo> {
        return await this.mailerService.sendMail({
            template: 'request-password',
            context: {
                link
            },
            to: email,
            from: this.configService.get('businessEmail'),
            subject: 'Request Password'
        });
    }

    async sendSignUpConfirmationEmail(email: string, link: string): Promise<SentMessageInfo> {
        return await this.mailerService.sendMail({
            template: 'signup-confirmation',
            context: {
                link
            },
            to: email,
            from: this.configService.get('businessEmail'),
            subject: 'Confirm your email'
        });
    }
}
