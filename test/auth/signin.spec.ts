import * as request from 'supertest';
import {testApp} from "../setup";
import {User} from "../../src/users";
import {UserStatus} from "../../src/users/models/user-status.enum";
import {NotificationsService} from "../../src/notifications/services/notifications.service";

let sendSignUpConfirmationEmail = jest.fn();
NotificationsService.prototype.sendSignUpConfirmationEmail = sendSignUpConfirmationEmail;

it('signs in a user successfully', async () => {
    const email = 'test@test.com';
    const password = 'mypassword';

    const signUpResponse = await request(testApp.getHttpServer())
        .post('/auth/signup')
        .send({
            email,
            password
        })
        .expect(201);

    const user = signUpResponse.body as User;
    await User.update(user, {status: UserStatus.ACTIVE});

    const response = await request(testApp.getHttpServer())
        .post('/auth/signin')
        .send({
            email,
            password
        })
        .expect(200);

    expect(response.headers.authorization).toBeDefined();
    expect(sendSignUpConfirmationEmail).toHaveBeenCalledTimes(1);
});



it('returns 401 when a user tries login with an inactive account', async () => {
    const email = 'test@test.com';
    const password = 'mypassword';

    const user = User.create({email, password, status: UserStatus.INACTIVE});
    await user.save();

    await request(testApp.getHttpServer())
        .post('/auth/signin')
        .send({
            email,
            password
        })
        .expect(401);

    await User.update(user, {status: UserStatus.DELETED});

    await request(testApp.getHttpServer())
        .post('/auth/signin')
        .send({
            email,
            password
        })
        .expect(401);

    expect(sendSignUpConfirmationEmail).toHaveBeenCalledTimes(0);
});
