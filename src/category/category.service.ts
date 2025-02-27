/* eslint-disable prettier/prettier */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categpryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const check = await this.categpryRepository.findBy({
      displayText: createCategoryDto.displayText,
    });

    if (check) throw new ConflictException('This product this pr');

    const newProduct = this.categpryRepository.create(createCategoryDto);

    return await this.categpryRepository.save(newProduct);
  }

  async findAll() {
    return await this.categpryRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const check = await this.categpryRepository.findBy({
      displayText: updateCategoryDto.displayText,
    });

    if (!check) throw new NotFoundException('Product not found !');

    return this.categpryRepository.update(id, updateCategoryDto);
  }

  remove(id: number) {
    return this.categpryRepository.delete(id);
  }
}
