import * as request from 'supertest';
import {testApp} from '../setup';
import {User} from '../../src/users';
import {NotificationsService} from '../../src/notifications/services/notifications.service';
import {UserStatus} from "../../src/users/models/user-status.enum";

let sendResetPasswordEmail = jest.fn();
NotificationsService.prototype.sendResetPasswordEmail = sendResetPasswordEmail;

it('successfully processes a password request', async () => {
    const email = 'test@test.com';

    await global.signin(email);

    await request(testApp.getHttpServer())
        .post('/auth/request-password')
        .send({email})
        .expect(200);


    expect(sendResetPasswordEmail).toHaveBeenCalledTimes(1);

    const user = await User.findOne({where: {email}, relations: ['passwordReset']});

    expect(user.passwordReset).toBeDefined();
    expect(user.passwordReset.token).toBeDefined();
    expect(user.passwordReset.expirationDate).toBeDefined();
});

it('should return a 404 if the user is not found', async () => {
    const email = 'test@test.com';

    await request(testApp.getHttpServer())
        .post('/auth/request-password')
        .send({email})
        .expect(404);
});

it('should return a 401 if the user has status cancelled or inactive', async () => {
    const email = 'test@test.com';

    await global.signin(email);

    const user = await User.findOne({where: {email}});

    await User.update(user, {status: UserStatus.INACTIVE});

    await request(testApp.getHttpServer())
        .post('/auth/request-password')
        .send({email})
        .expect(401);

    await User.update(user, {status: UserStatus.DELETED});

    await request(testApp.getHttpServer())
        .post('/auth/request-password')
        .send({email})
        .expect(401);
});


