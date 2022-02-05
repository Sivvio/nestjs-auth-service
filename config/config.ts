import {HandlebarsAdapter} from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
const path = require('path');

export default () => ({
    port: parseInt(process.env.PORT),
    database: {
        type: process.env.DB_TYPE,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        entities: ['dist/**/*.entity{.ts,.js}'],
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRATION,
        signupSecret: process.env.JWT_SIGNUP_SECRET,
        signUpExpiresIn: process.env.JWT_SIGNUP_EXPIRATION
    },
    email: {
        transport: {
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
        },
        template: {
            dir: path.join(__dirname,'../src/notifications/email-templates/'),
            adapter: new HandlebarsAdapter(),
            options: {
                strict: true,
            },
        },
    }
});
