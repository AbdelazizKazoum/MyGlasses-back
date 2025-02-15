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
import { Address } from 'src/entities/address.entity';

const salt = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
    @InjectRepository(Address) private addressRepository: Repository<Address>,
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

  async findOne(email: string): Promise<Users | null> {
    return await this.usersRepository.findOne({
      where: { email },
      relations: ['addressList'],
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

  // Method to add a new address for a user and set it as the primary address
  async addAddress(
    userId: string,
    addressData: Omit<Address, 'id' | 'status'>,
  ) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create the new address
    const newAddress = this.addressRepository.create({
      ...addressData,
      user: user,
    });

    try {
      // Save the new address
      await this.addressRepository.save(newAddress);

      // Set the new address as the primary address for the user
      user.primaryAddress = newAddress.id;
      await this.usersRepository.save(user);

      return newAddress; // Return the newly added address
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to add address');
    }
  }

  // Method to update an existing address
  async updateAddress(addressId: string, updatedAddressData: Partial<Address>) {
    const address = await this.addressRepository.findOne({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    try {
      await this.addressRepository.update(addressId, updatedAddressData);
      return await this.addressRepository.findOne({ where: { id: addressId } });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to update address');
    }
  }

  // Method to mark an address as removed
  async removeAddress(addressId: string) {
    const address = await this.addressRepository.findOne({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    try {
      await this.addressRepository.update(addressId, { status: 'removed' });
      return await this.addressRepository.findOne({ where: { id: addressId } });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to remove address');
    }
  }
}
