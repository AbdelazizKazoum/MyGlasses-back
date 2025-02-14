/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

const salt = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const check = await this.findOne(createUserDto.email);

    if (check) {
      console.log('found : ', check);
      throw new ConflictException('User already exists');
    }

    try {
      const password = createUserDto.password;

      const hash = await bcrypt.hash(password, salt);

      const newUser = this.usersRepository.create({
        ...createUserDto,
        password: hash,
      });

      return await this.usersRepository.save(newUser);
    } catch (error) {
      return new InternalServerErrorException(error);
    }
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(email: string) {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(
          updateUserDto.password,
          salt,
        );
      }

      await this.usersRepository.update(id, updateUserDto);

      return await this.usersRepository.findOne({ where: { id } });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException('Failed to update user');
    }
  }

  remove(id: string) {
    return this.usersRepository.delete(id);
  }
}
