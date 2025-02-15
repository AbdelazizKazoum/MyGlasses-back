/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Address } from 'src/entities/address.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // Endpoint to add a new address to a user
  @Post(':userId/address')
  async addAddress(
    @Param('userId') userId: string,
    @Body() addressData: Omit<Address, 'id' | 'status'>,
  ) {
    return this.usersService.addAddress(userId, addressData);
  }

  // Endpoint to update an existing address
  @Patch('address/:addressId')
  async updateAddress(
    @Param('addressId') addressId: string,
    @Body() updatedAddressData: Partial<Address>,
  ) {
    return this.usersService.updateAddress(addressId, updatedAddressData);
  }

  // Endpoint to remove an address (mark it as removed)
  @Patch('address/:addressId/remove')
  async removeAddress(@Param('addressId') addressId: string) {
    return this.usersService.removeAddress(addressId);
  }
}
