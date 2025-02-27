import { FileUploadService } from './../common/services/file-upload.service';
/* eslint-disable prettier/prettier */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
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
    private fileUploadService: FileUploadService,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    file: Express.Multer.File,
  ) {
    const check = await this.categpryRepository.findOne({
      where: { displayText: createCategoryDto.displayText },
    });

    if (check) throw new ConflictException('This product is already exists !');

    try {
      const newProduct = this.categpryRepository.create(createCategoryDto);

      const savedCategory = await this.categpryRepository.save(newProduct);

      const uploadPath = `uploads/categories/${savedCategory.id}`;
      const allowedFormats = ['png', 'jpg', 'jpeg', 'PNG'];

      const defaultImagePaths = await this.fileUploadService.uploadFiles(
        [file],
        uploadPath,
        allowedFormats,
      );
      // default image path
      const defaultImagePath = Object.values(defaultImagePaths)[0];

      savedCategory.imageUrl = defaultImagePath;

      return await this.categpryRepository.save(savedCategory);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAll() {
    return await this.categpryRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    file: Express.Multer.File,
  ) {
    const category = await this.categpryRepository.findOneBy({
      id,
    });

    if (!category) throw new NotFoundException('Product not found !');

    if (updateCategoryDto.category)
      category.category = updateCategoryDto.category;

    if (updateCategoryDto.displayText)
      category.displayText = updateCategoryDto.displayText;

    if (file) {
      const uploadPath = `uploads/categories/${category.id}`;
      const allowedFormats = ['png', 'jpg', 'jpeg', 'PNG'];

      const defaultImagePaths = await this.fileUploadService.uploadFiles(
        [file],
        uploadPath,
        allowedFormats,
      );
      // default image path
      const defaultImagePath = Object.values(defaultImagePaths)[0];

      category.imageUrl = defaultImagePath;
    }

    return this.categpryRepository.save(category);
  }

  remove(id: number) {
    return this.categpryRepository.delete(id);
  }
}
