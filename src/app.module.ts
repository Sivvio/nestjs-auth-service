import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {ConfigModule} from '@nestjs/config';
import { UsersModule } from './users';
import configuration from '../config/config';
import {AuthModule} from "./auth/auth.module";
import {NotificationsModule} from "./notifications/notifications.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
        }),
        AuthModule,
        UsersModule,
        NotificationsModule.forRoot(),
    ],
    controllers: [AppController]
})
export class AppModule {
}
