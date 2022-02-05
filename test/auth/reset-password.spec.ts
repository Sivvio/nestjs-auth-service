import * as request from "supertest";
import {testApp} from "../setup";
import {HashUtilService} from "../../src/auth/services/hash-util.service";
import {User} from "../../src/users";
import {PasswordReset} from "../../src/users/entities/password-reset.entity";
import {randomUUID} from "crypto";
import {UserStatus} from "../../src/users/models/user-status.enum";
import {NotificationsService} from "../../src/notifications/services/notifications.service";

NotificationsService.prototype.sendResetPasswordEmail = jest.fn();

it('successfully processes a password reset', async () => {
    const email = 'test@test.com';

    await global.signin(email);

    jest.spyOn(HashUtilService.prototype, 'compareTokens').mockImplementation(() => {
        return Promise.resolve(true);
    });

    await request(testApp.getHttpServer())
        .post('/auth/request-password')
        .send({email})
        .expect(200);

    const user = await User.findOne({where: {email}, relations: ['passwordReset']});

    await request(testApp.getHttpServer())
        .post('/auth/reset-password')
        .send({
            id: user.passwordReset.id,
            resetToken: 'validResetToken',
            newPassword: 'password2'
        })
        .expect(200);

    const passwordReset = await PasswordReset.findOne(user.passwordReset.id);
    expect(passwordReset).toBeUndefined();

    const resetPasswordUser = await User.findOne({where: {email}});
    expect(resetPasswordUser).toBeDefined();

});

it('throws a 400 when password id is not found', async () => {
    const email = 'test@test.com';

    await global.signin(email);

    await request(testApp.getHttpServer())
        .post('/auth/request-password')
        .send({email})
        .expect(200);

    await request(testApp.getHttpServer())
        .post('/auth/reset-password')
        .send({
            id: randomUUID(),
            resetToken: 'validResetToken',
            newPassword: 'password2'
        })
        .expect(400);

});

it('throws a 401 when token does not match stored one', async () => {
    const email = 'test@test.com';

    await global.signin(email);

    jest.spyOn(HashUtilService.prototype, 'compareTokens').mockImplementation(() => {
        return Promise.resolve(false);
    });

    await request(testApp.getHttpServer())
        .post('/auth/request-password')
        .send({email})
        .expect(200);

    const user = await User.findOne({where: {email}, relations: ['passwordReset']});

    await request(testApp.getHttpServer())
        .post('/auth/reset-password')
        .send({
            id: user.passwordReset.id,
            resetToken: 'invalidResetToken',
            newPassword: 'password2'
        })
        .expect(401);

});

it('throws a 401 when user is inactive', async () => {
    const email = 'test@test.com';

    await global.signin(email);

    jest.spyOn(HashUtilService.prototype, 'compareTokens').mockImplementation(() => {
        return Promise.resolve(true);
    });

    await request(testApp.getHttpServer())
        .post('/auth/request-password')
        .send({email})
        .expect(200);

    const user = await User.findOne({where: {email}, relations: ['passwordReset']});

    await User.update(user, {status: UserStatus.INACTIVE});

    await request(testApp.getHttpServer())
        .post('/auth/reset-password')
        .send({
            id: user.passwordReset.id,
            resetToken: 'validResetToken',
            newPassword: 'password2'
        })
        .expect(401);

    await User.update(user, {status: UserStatus.DELETED});

    await request(testApp.getHttpServer())
        .post('/auth/reset-password')
        .send({
            id: user.passwordReset.id,
            resetToken: 'validResetToken',
            newPassword: 'password2'
        })
        .expect(401);

});

it('throws a 401 if the request has expired', async () => {
    const email = 'test@test.com';

    await global.signin(email);

    jest.spyOn(HashUtilService.prototype, 'compareTokens').mockImplementation(() => {
        return Promise.resolve(true);
    });

    await request(testApp.getHttpServer())
        .post('/auth/request-password')
        .send({email})
        .expect(200);

    const user = await User.findOne({where: {email}, relations: ['passwordReset']});

    const invalidDate = new Date(new Date().setDate(new Date().getDate() - 10));
    await PasswordReset.update(user.passwordReset.id, {expirationDate: invalidDate})

    await request(testApp.getHttpServer())
        .post('/auth/reset-password')
        .send({
            id: user.passwordReset.id,
            resetToken: 'validResetToken',
            newPassword: 'password2'
        })
        .expect(401);
});
