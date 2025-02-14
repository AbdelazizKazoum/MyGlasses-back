/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { RegisterDto } from './dto/registerUser.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Users } from 'src/entities/users.entity';
import { JwtAuthGuard } from './guards/jwt-auth-guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async signIn(@Res() res: Response, @Req() req: Request) {
    // res.send(req.user);
    const user = req.user as Users;
    return await this.authService.signIn(user, res);
  }

  @Post('register')
  async register(@Body() registerUser: RegisterDto) {
    return await this.authService.register(registerUser);
  }

  @Get('logout')
  logout(@Res() res: Response) {
    return this.authService.logout(res);
  }

  @Get('refresh')
  async refreshToken(@Res() res: Response, @Req() req: Request) {
    return await this.authService.refreshToken(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Req() req: Request) {
    console.log(req);
    return req.user;
  }
}
