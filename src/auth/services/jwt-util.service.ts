import {User, UsersService} from '../../users';
import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import {ActivateAccountTokenPayload} from "../models/reset-password-token-payload.class";

@Injectable()
export class JwtUtilService {
    constructor(private readonly usersService: UsersService,
                private readonly jwtService: JwtService,
                private readonly configService: ConfigService,
    ) {
    }

    signJwt(user: User): string {
        return `Bearer ${this.jwtService.sign({
            sub: user.id,
            email: user.email
        })}`;
    }

    verifyJwt(jwt: string): Promise<boolean> {
        return this.jwtService.verify(jwt);
    }

    signSignUpJwt(user: User): string {
        return this.jwtService.sign({sub: user.id}, {
            expiresIn: '1d',
            secret: this.configService.get('jwt.signUpExpiresIn')
        });
    }

    verifySignUpJwt(jwt: string): Promise<boolean> {
        return this.jwtService.verify(jwt, {secret: this.configService.get('jwt.signupSecret')});
    }

    getSignUpJwtPayload(jwt: string): ActivateAccountTokenPayload {
        return this.jwtService.decode(jwt) as ActivateAccountTokenPayload;
    }
}
