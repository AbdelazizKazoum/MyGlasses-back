import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Repository } from 'typeorm';
import { Images } from 'src/entities/images.entity';

@Injectable()
export class ProductService {

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Images)
    private imagesRepository: Repository<Images>,

  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Create a new product instance
    const newProduct = await this.productRepository.create(createProductDto);

    // Save the product to the database
    return await this.productRepository.save(newProduct);
  }

   async findAll() {
    return await this.productRepository.find({
      relations: ['detail', "detail.images"],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }



  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
