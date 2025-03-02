/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CreateDetailProductDto } from './dto/create-detail-product.dto';
import { UpdateDetailProductDto } from './dto/update-detail-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DetailProduct } from 'src/entities/detailProduct.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DetailProductService {
  constructor(
    @InjectRepository(DetailProduct)
    private detailProduct: Repository<DetailProduct>,
  ) {}

  create(createDetailProductDto: CreateDetailProductDto) {
    return 'This action adds a new detailProduct';
  }

  findAll() {
    return `This action returns all detailProduct`;
  }

  findOne(id: number) {
    return `This action returns a #${id} detailProduct`;
  }

  update(id: number, updateDetailProductDto: UpdateDetailProductDto) {
    return `This action updates a #${id} detailProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} detailProduct`;
  }
}
