import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import {User, UsersService} from '../../users';
import {SignupDto} from '../dto/signup.dto';
import {SigninDto} from '../dto/signin.dto';
import {PasswordResetRequestDto} from '../dto/password-reset-request.dto';
import {JwtUtilService} from './jwt-util.service';
import {ConfigService} from '@nestjs/config';
import {ResetPasswordDto} from '../dto/reset-password-dto';
import {UserStatus} from '../../users/models/user-status.enum';
import {HashUtilService} from './hash-util.service';
import {PasswordReset} from '../../users/entities/password-reset.entity';
import {NotificationsService} from '../../notifications/services/notifications.service';
import {ActivateAccountDto} from "../dto/activate-account.dto";

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService,
                private readonly jwtUtilService: JwtUtilService,
                private readonly configService: ConfigService,
                private readonly hashUtilService: HashUtilService,
                private readonly notificationsService: NotificationsService
    ) {
    }

    async signup(signupDto: SignupDto): Promise<User> {
        const existing = await this.usersService.findByEmail(signupDto.email);

        if (existing) {
            throw new ConflictException();
        }

        const password = await this.hashUtilService.hashPassword((signupDto.password));

        const user = await User.create({
            email: signupDto.email,
            password
        }).save();

        const activationToken = this.jwtUtilService.signSignUpJwt(user);

        const link = `${this.configService.get('clientBaseURI')}/auth/activate-account?token=${activationToken}`;

        await this.notificationsService.sendSignUpConfirmationEmail(user.email, link);

        return user;

    }

    async signin(signinDto: SigninDto): Promise<User> {
        const existing = await this.usersService.findByEmail(signinDto.email);

        this.throwIfNotFound(existing);

        this.throwIfInactive(existing);

        const passwordMatch = await this.hashUtilService.doesPasswordMatch(signinDto.password, existing.password);

        if (!passwordMatch) {
            throw new ConflictException();
        }

        return existing;
    }

    async activateAccount(activateAccountDto: ActivateAccountDto): Promise<void> {
        const isValid = await this.jwtUtilService.verifySignUpJwt(activateAccountDto.activationToken);

        if (!isValid) {
            throw new UnauthorizedException();
        }

        const userId = this.jwtUtilService.getSignUpJwtPayload(activateAccountDto.activationToken).sub;

        const user = await User.findOne(userId);

        this.throwIfNotFound(user);

        if (user.status !== UserStatus.INACTIVE) {
            throw new BadRequestException();
        }

        await User.update(user, {status: UserStatus.ACTIVE});
    }

    async requestPassword(requestPasswordDto: PasswordResetRequestDto): Promise<void> {
        const existing = await this.usersService.findByEmail(requestPasswordDto.email);

        this.throwIfNotFound(existing);

        this.throwIfInactive(existing);

        const resetToken = await this.hashUtilService.createToken();

        const id = await PasswordReset.create({
            user: existing,
            token: resetToken
        }).save();

        const link = `${this.configService.get('clientBaseURI')}/auth/reset-password?id=${id}token=${resetToken}`;

        await this.notificationsService.sendResetPasswordEmail(existing.email, link);

    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
        const exists = await PasswordReset.findOne({where: {id: resetPasswordDto.id}, relations: ['user']});

        if (!exists) {
            throw new BadRequestException();
        }

        const valid = await this.hashUtilService.compareTokens(resetPasswordDto.resetToken, exists.token)

        this.throwIfInactive(exists.user);

        if (!valid || new Date().getTime() > new Date(exists.expirationDate).getTime()) {
            throw new UnauthorizedException();
        }

        const newHashedPassword = await this.hashUtilService.hashPassword(resetPasswordDto.newPassword);

        await User.update(exists.user, {password: newHashedPassword});

        await PasswordReset.delete({id: resetPasswordDto.id});

    }

    private throwIfInactive(user: User): void {
        if (user.status !== UserStatus.ACTIVE) {
            throw new UnauthorizedException();
        }
    }

    private throwIfNotFound(user: User): void {
        if (!user) {
            throw new NotFoundException();
        }
    }

}
