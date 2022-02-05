import * as request from "supertest";
import {testApp} from "../setup";
import {User} from "../../src/users";
import {UserStatus} from "../../src/users/models/user-status.enum";
import {JwtUtilService} from "../../src/auth/services/jwt-util.service";
import {randomUUID} from "crypto";

it('successfully activates a user account', async () => {
    const email = 'test@test.com';
    const password = 'mypassword';

    const user = User.create({email, password, status: UserStatus.INACTIVE});
    await user.save();

    jest.spyOn(JwtUtilService.prototype, 'getSignUpJwtPayload').mockImplementation(() => ({
        sub: user.id
    }));

    jest.spyOn(JwtUtilService.prototype, 'verifySignUpJwt').mockImplementation(() => {
        return Promise.resolve(true);
    });

    await request(testApp.getHttpServer())
        .post('/auth/activate-account')
        .send({
            activationToken: 'activationToken'
        })
        .expect(202);

    const activatedUser = await User.findOne({where: {email}});

    expect(activatedUser.status).toEqual(UserStatus.ACTIVE);
});

it('should return 400 if the user is ACTIVE or DELETED', async () => {
    const email = 'test@test.com';
    const password = 'mypassword';

    const user = User.create({email, password, status: UserStatus.ACTIVE});
    await user.save();

    jest.spyOn(JwtUtilService.prototype, 'getSignUpJwtPayload').mockImplementation(() => ({
        sub: user.id
    }));

    jest.spyOn(JwtUtilService.prototype, 'verifySignUpJwt').mockImplementation(() => {
        return Promise.resolve(true);
    });

    await request(testApp.getHttpServer())
        .post('/auth/activate-account')
        .send({
            activationToken: 'activationToken'
        })
        .expect(400);

    await User.update(user, {status: UserStatus.DELETED});

    await request(testApp.getHttpServer())
        .post('/auth/activate-account')
        .send({
            activationToken: 'activationToken'
        })
        .expect(400);
});

it('returns 404 if the user cannot be found', async () => {

    jest.spyOn(JwtUtilService.prototype, 'getSignUpJwtPayload').mockImplementation(() => ({
        sub: randomUUID()
    }));

    jest.spyOn(JwtUtilService.prototype, 'verifySignUpJwt').mockImplementation(() => {
        return Promise.resolve(true);
    });

    await request(testApp.getHttpServer())
        .post('/auth/activate-account')
        .send({
            activationToken: 'activationToken'
        })
        .expect(404);
});

it('returns 401 if the token is not valid', async () => {

    const email = 'test@test.com';
    const password = 'mypassword';

    const user = User.create({email, password, status: UserStatus.ACTIVE});
    await user.save();

    jest.spyOn(JwtUtilService.prototype, 'getSignUpJwtPayload').mockImplementation(() => ({
        sub: user.id
    }));

    jest.spyOn(JwtUtilService.prototype, 'verifySignUpJwt').mockImplementation(() => {
        return Promise.resolve(false);
    });

    await request(testApp.getHttpServer())
        .post('/auth/activate-account')
        .send({
            activationToken: 'activationToken'
        })
        .expect(401);
});
