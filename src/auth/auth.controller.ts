import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { Request, Response } from 'express';
import { RegisterDto } from './dto/registerUser.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.send(req.user);

    return await this.authService.signIn(signInDto, res);
  }

  @Post('register')
  async register(@Body() registerUser: RegisterDto) {
    return await this.authService.register(registerUser);
  }
}
