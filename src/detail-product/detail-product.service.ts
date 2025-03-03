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
import { Repository } from 'typeorm';
import { ProductService } from 'src/product/product.service';
import { Images } from 'src/entities/images.entity';
import { FileUploadService } from 'src/common/services/file-upload.service';

@Injectable()
export class DetailProductService {
  constructor(
    @InjectRepository(DetailProduct)
    private detailProduct: Repository<DetailProduct>,
    private productService: ProductService,
    @InjectRepository(Images)
    private imagesRepository: Repository<Images>,
    private fileUploadService: FileUploadService,
  ) {}

  async create(
    id: string,
    variant: CreateDetailProductDto,
    images: Express.Multer.File[],
  ) {
    console.log('🚀 ~ DetailProductService ~ id:', id);

    const allowedFormats = ['png', 'jpg', 'jpeg', 'PNG'];

    const product = await this.productService.getProductOnly(id);
    console.log('🚀 ~ DetailProductService ~ product:', product);

    if (!product)
      throw new NotFoundException('Product for this variant not exist !');

    try {
      const newVariant = this.detailProduct.create({
        ...variant,
        product,
      });

      const savedVariant = await this.detailProduct.save(newVariant);

      if (images) {
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

        await this.imagesRepository.save(imageEntities);
      }

      return savedVariant;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async findAll(id: string) {
    return await this.detailProduct.find({
      where: { product: { id } },
      relations: ['images'], // Load the related images
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} detailProduct`;
  }

  async update(
    id: string,
    variant: UpdateDetailProductDto,
    newImages: Express.Multer.File[],
    removedImages: string[],
  ) {
    console.log('🚀 ~ DetailProductService ~ id:', id);
    const allowedFormats = ['png', 'jpg', 'jpeg', 'PNG'];

    const searchVariant = await this.detailProduct.findOne({ where: { id } });

    if (!searchVariant) throw new NotFoundException('Variant is not found !');

    try {
      Object.assign(searchVariant, variant);

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

      if (removedImages.length > 0) {
        this.fileUploadService.deleteFiles(removedImages);

        for (const item of removedImages) {
          await this.imagesRepository.delete({ image: item });
        }
      }
      await this.detailProduct.save(searchVariant);

      return await this.detailProduct.findOne({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    return `This action updates a #${id} detailProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} detailProduct`;
  }
}
