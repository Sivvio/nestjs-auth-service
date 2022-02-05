import {Body, Controller, Post, Response} from '@nestjs/common';
import {AuthService} from './services/auth.service';

import { Response as Res } from 'express';
import {JwtUtilService} from "./services/jwt-util.service";
import {plainToClass} from "class-transformer";
import {User} from "../users";
import {SignupDto} from "./dto/signup.dto";
import {PasswordResetRequestDto} from "./dto/password-reset-request.dto";
import {ResetPasswordDto} from "./dto/reset-password-dto";
import {ActivateAccountDto} from "./dto/activate-account.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly jwtUtilService: JwtUtilService) {}

  @Post('/signup')
  async signup(@Body() createAuthDto: SignupDto, @Response() res: Res) {
    const user = await this.authService.signup(createAuthDto);
    return res
        .status(201)
        .send(plainToClass(User, user));
  }

  @Post('/signin')
  async signin(@Body() createAuthDto: SignupDto, @Response() res: Res) {
    const user = await this.authService.signin(createAuthDto);
    return res
        .header('Authorization', this.jwtUtilService.signJwt(user))
        .status(200)
        .send(plainToClass(User, user));
  }

  @Post('/activate-account')
  async activateAccount(@Body() activateAccountDto: ActivateAccountDto, @Response() res: Res) {
    await this.authService.activateAccount(activateAccountDto);
    return res
        .status(202)
        .send();
  }

  @Post('/request-password')
  async requestPassword(@Body() requestPasswordDto: PasswordResetRequestDto, @Response() res: Res) {
    await this.authService.requestPassword(requestPasswordDto);
    return res
        .status(200)
        .send();
  }

  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Response() res: Res) {
    await this.authService.resetPassword(resetPasswordDto);
    return res
        .status(200)
        .send();
  }
}
