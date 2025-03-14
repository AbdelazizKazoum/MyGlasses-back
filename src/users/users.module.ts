/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { SharedModule } from 'src/common/services/shared.module';
import { Address } from 'src/entities/address.entity';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([Users, Address])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
