import {DynamicModule, Module} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {MailerModule} from "@nestjs-modules/mailer";
import {NotificationsService} from "./services/notifications.service";

@Module({
    imports: [
        MailerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => config.get('email'),
        }),
    ]
})
export class NotificationsModule {
    static forRoot(): DynamicModule {
        return {
            module: NotificationsModule,
            providers: [NotificationsService],
            exports: [NotificationsService],
            global: true
        };
    }
}
