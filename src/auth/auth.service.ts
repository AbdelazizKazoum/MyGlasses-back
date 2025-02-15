/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { Response, Request } from 'express';
import * as bcrypt from 'bcrypt';
import { Users } from 'src/entities/users.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(user: Users, res: Response) {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m', // Short expiration for security
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d', // Longer expiration for refresh token
    });

    // Set tokens in HTTP-only cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;

    return res.json({ message: 'Login successful', user: rest });
  }

  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) throw new ForbiddenException('Refresh token missing');

    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken);

      const newAccessToken = await this.jwtService.signAsync(
        { id: decoded.id, email: decoded.email, role: decoded.role },
        { expiresIn: '15m' },
      );

      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      return res.json({ message: 'Token refreshed' });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new ForbiddenException('Invalid refresh token');
    }
  }

  logout(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.json({ message: 'Logged out successfully' });
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new NotFoundException('User Not Found!');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid Credentials!');

    return user;
  }

  async register(registerUser: CreateUserDto) {
    return this.usersService.create(registerUser);
  }

  async profile(user: Users) {
    try {
      const getUser = await this.usersService.findOne(user.email);

      if (getUser) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = getUser;
        rest.addressList = getUser.addressList.filter(
          (address) => address.status !== 'removed',
        );
        return rest;
      }

      return null;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }
}
