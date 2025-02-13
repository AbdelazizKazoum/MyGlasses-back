import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/registerUser.dto';
import { UsersService } from 'src/users/users.service';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto, res: Response) {
    const user = await this.validateUser(signInDto.email, signInDto.password);

    const payload = { id: user.id, email: user.email, role: user.role };

    const token = await this.jwtService.signAsync(payload);

    // Set token in an HTTP-only cookie
    res.cookie('auth_token', token, {
      httpOnly: true, // Prevent access from JavaScript
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
    });

    return res.json({ message: 'Login successful' }); // No token returned
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOne(email);
    console.log('🚀 ~ AuthService ~ validateUser ~ user:', user);

    if (!user) {
      throw new UnauthorizedException('User Not Found !');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) throw new UnauthorizedException('Invalid Credentials !');

    return user;
  }

  async register(registerUser: RegisterDto) {
    return this.usersService.create(registerUser);
  }
}
