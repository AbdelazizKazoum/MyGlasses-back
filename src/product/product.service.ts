/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Repository, DataSource } from 'typeorm';
import { Images } from 'src/entities/images.entity';
import { FileUploadService } from 'src/common/services/file-upload.service';
import { DetailProduct } from 'src/entities/detailProduct.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Images)
    private imagesRepository: Repository<Images>,
    @InjectRepository(DetailProduct)
    private detailProductRepository: Repository<DetailProduct>,
    private fileUploadService: FileUploadService,
    private dataSource: DataSource, // Inject DataSource for transactions
  ) {}

  async create(
    createProductDto: CreateProductDto,
    images: { [color: string]: Express.Multer.File[] },
    defaultImage: Express.Multer.File[],
  ): Promise<Product | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create and save the product
      const newProduct = this.productRepository.create({
        ...createProductDto,
        image: '', // Initially empty
      });
      const savedProduct = await queryRunner.manager.save(newProduct);

      const uploadPath = `uploads/products/${savedProduct.id}/images/default`;
      const allowedFormats = ['png', 'jpg', 'jpeg', 'PNG'];

      // Upload default image and get its path
      const defaultImagePaths = await this.fileUploadService.uploadFiles(
        defaultImage,
        uploadPath,
        allowedFormats,
      );

      // default image path
      const defaultImagePath = Object.values(defaultImagePaths)[0];

      if (defaultImagePath) {
        savedProduct.image = defaultImagePath;
        await queryRunner.manager.save(savedProduct); // Update the product image path
      }

      if (images) {
        for (const color of Object.keys(images)) {
          // Create and save detail product
          const newColor = this.detailProductRepository.create({
            color: color,
            product: savedProduct,
          });

          const savedColor = await queryRunner.manager.save(newColor);

          const colorUploadPath = `uploads/products/${savedProduct.id}/images/${savedColor.id}`;

          // Upload images and save paths
          const colorFilePaths = await this.fileUploadService.uploadFiles(
            images[color],
            colorUploadPath,
            allowedFormats,
          );

          console.log('🚀 ~ ProductService ~ colorFilePaths:', colorFilePaths);

          const imageEntities = Object.values(colorFilePaths).map((imagePath) =>
            this.imagesRepository.create({
              image: imagePath,
              detailProduct: savedColor,
            }),
          );

          await queryRunner.manager.save(imageEntities);
        }
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return product with relations
      return this.productRepository.findOne({
        where: { id: savedProduct.id },
        relations: ['detail', 'detail.images'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error creating product:', error);
      throw new InternalServerErrorException('Failed to create product');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.productRepository.find({
      relations: ['detail', 'detail.images'],
    });
  }

  async findOne(id: string) {
    return await this.productRepository.findOne({
      where: { id },
      relations: ['detail', 'detail.images'],
    });
  }

  async remove(id: string) {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new InternalServerErrorException(`Product with ID ${id} not found`);
    }
    return { message: `Product #${id} deleted successfully` };
  }
}
