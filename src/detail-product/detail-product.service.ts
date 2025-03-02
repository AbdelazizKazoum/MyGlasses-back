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
