import * as request from 'supertest';
import {testApp} from "../setup";
import {User} from "../../src/users";
import {UserStatus} from "../../src/users/models/user-status.enum";
import {NotificationsService} from "../../src/notifications/services/notifications.service";

let sendSignUpConfirmationEmail = jest.fn();
NotificationsService.prototype.sendSignUpConfirmationEmail = sendSignUpConfirmationEmail;

it('signs up a new user successfully', async () => {
    const email = 'test@test.com';
    const password = 'mypassword';

    const response = await request(testApp.getHttpServer())
        .post('/auth/signup')
        .send({
            email,
            password
        })
        .expect(201);

    expect(response.body.email).toEqual(email);
    expect(response.body.password).toBeUndefined();
    expect(response.body.status).toBeUndefined();

    const user = await User.findOne(response.body.id);
    expect(user.status).toEqual(UserStatus.INACTIVE);

    expect(sendSignUpConfirmationEmail).toHaveBeenCalledTimes(1);

    expect(response.headers.authorization).toBeUndefined();

});

it('returns 409 when a user tries to register more than once', async () => {
    const email = 'test@test.com';
    const password = 'mypassword';

    const user = User.create({email, password});
    await user.save();

    const response = await request(testApp.getHttpServer())
        .post('/auth/signup')
        .send({
            email,
            password
        })
        .expect(409);

    expect(response.headers.authorization).toBeUndefined();
});
