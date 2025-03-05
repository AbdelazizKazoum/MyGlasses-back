/* eslint-disable prettier/prettier */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateDetailProductDto } from './dto/create-detail-product.dto';
import { UpdateDetailProductDto } from './dto/update-detail-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DetailProduct } from 'src/entities/detailProduct.entity';
import { DataSource, Repository } from 'typeorm';
import { ProductService } from 'src/product/product.service';
import { Images } from 'src/entities/images.entity';
import { FileUploadService } from 'src/common/services/file-upload.service';
import { Stock } from 'src/entities/stock.entity';

@Injectable()
export class DetailProductService {
  constructor(
    @InjectRepository(DetailProduct)
    private detailProduct: Repository<DetailProduct>,
    private readonly dataSource: DataSource, // Inject TypeORM's DataSource for transactions

    private productService: ProductService,
    @InjectRepository(Images)
    private imagesRepository: Repository<Images>,
    private fileUploadService: FileUploadService,
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
  ) {}

  async create(
    id: string,
    variant: CreateDetailProductDto,
    images: Express.Multer.File[],
  ) {
    const allowedFormats = ['png', 'jpg', 'jpeg', 'PNG'];

    // Fetch the product
    const product = await this.productService.getProductOnly(id);
    console.log('🚀 ~ DetailProductService ~ product:', product);

    if (!product)
      throw new NotFoundException('Product for this variant does not exist!');

    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create and save the variant
      const newVariant = this.detailProduct.create({
        ...variant,
        product,
      });

      const savedVariant = await queryRunner.manager.save(newVariant);

      const newStock = this.stockRepository.create({
        productDetail: savedVariant,
        quantity: variant.qte,
      });

      await queryRunner.manager.save(newStock);

      if (images && images.length > 0) {
        const colorUploadPath = `uploads/products/${id}/images/${savedVariant.id}`;

        // Upload images and save paths
        const imagesPaths = await this.fileUploadService.uploadFiles(
          images,
          colorUploadPath,
          allowedFormats,
        );

        const imageEntities = Object.values(imagesPaths).map((imagePath) =>
          this.imagesRepository.create({
            image: imagePath,
            detailProduct: savedVariant,
          }),
        );

        await queryRunner.manager.save(imageEntities);
      }

      // Commit transaction if everything is successful
      await queryRunner.commitTransaction();

      return await this.detailProduct.findOne({
        where: { id: savedVariant.id },
        relations: ['images'],
      });
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to create product variant and images',
      );
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async findAll(id: string) {
    return await this.detailProduct.find({
      where: { product: { id } },
      relations: ['images'], // Load the related images
    });
  }

  async findOne(id: string): Promise<DetailProduct | null> {
    return await this.detailProduct.findOne({
      where: { id },
      relations: ['product'],
    });
  }

  async update(
    id: string,
    variant: UpdateDetailProductDto,
    newImages: Express.Multer.File[],
    removedImages: string[],
  ) {
    const allowedFormats = ['png', 'jpg', 'jpeg', 'PNG'];

    const searchVariant = await this.detailProduct.findOne({ where: { id } });

    if (!searchVariant) throw new NotFoundException('Variant is not found !');

    try {
      Object.assign(searchVariant, variant);

      // Remove images
      if (removedImages.length > 0) {
        this.fileUploadService.deleteFiles(removedImages);

        for (const item of removedImages) {
          await this.imagesRepository.delete({ image: item });
        }
      }

      if (newImages.length > 0) {
        const colorUploadPath = `uploads/products/${id}/images/${searchVariant.id}`;
        // Upload images and save paths
        const imagesPaths = await this.fileUploadService.uploadFiles(
          newImages,
          colorUploadPath,
          allowedFormats,
        );

        const imageEntities = Object.values(imagesPaths).map((imagePath) =>
          this.imagesRepository.create({
            image: imagePath,
            detailProduct: searchVariant,
          }),
        );

        await this.imagesRepository.save(imageEntities);
      }

      await this.detailProduct.save(searchVariant);

      return await this.detailProduct.findOne({
        where: { id },
        relations: ['images'],
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} detailProduct`;
  }
}
