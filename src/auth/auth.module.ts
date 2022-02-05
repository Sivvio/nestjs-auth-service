import {Module} from '@nestjs/common';
import {AuthService} from './services/auth.service';
import {AuthController} from './auth.controller';
import {UsersModule} from "../users";
import {JwtModule} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";
import {JwtUtilService} from "./services/jwt-util.service";
import {HashUtilService} from "./services/hash-util.service";

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get('jwt.secret'),
                signOptions: {expiresIn: config.get('jwt.expiresIn')}
            })
        }),
        UsersModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtUtilService, HashUtilService]
})
export class AuthModule {
}
