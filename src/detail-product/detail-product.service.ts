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
import { CategoryService } from 'src/category/category.service';

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
    private categoryService: CategoryService,

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

      const savedStock = await queryRunner.manager.save(newStock);

      // Now update the DetailProduct to reference the stock
      await queryRunner.manager.update(DetailProduct, savedVariant.id, {
        stock: savedStock,
      });

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
        relations: ['images', 'stock'],
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
      relations: ['images', 'stock'], // Load the related images
    });
  }

  async getStock(id: string): Promise<number> {
    const stock = await this.stockRepository.findOne({
      where: { productDetail: { id } },
    });
    return stock ? stock.quantity : 0;
  }

  async updateStock(id: string, qty: number): Promise<DetailProduct | null> {
    const variant = await this.detailProduct.findOne({ where: { id } });

    if (!variant) throw new NotFoundException('Product is no longer exist !');

    try {
      let stock = await this.stockRepository.findOne({
        where: { productDetail: { id } },
      });

      if (!stock) {
        const newStock = this.stockRepository.create({
          productDetail: { id },
          quantity: qty,
        });

        stock = await this.stockRepository.save(newStock);
        variant.stock = stock;
        await this.detailProduct.save(variant);
        return await this.detailProduct.findOne({
          where: { id },
          relations: ['images', 'stock'],
        });
      }

      stock.quantity = stock.quantity + Number(qty);
      stock.updated = new Date().toLocaleDateString();

      await this.stockRepository.save(stock);

      return await this.detailProduct.findOne({
        where: { id },
        relations: ['images', 'stock'],
      });
    } catch (error) {
      console.log('🚀 ~ DetailProductService ~ updateStock ~ error:', error);

      throw new InternalServerErrorException(error);
    }
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
        relations: ['images', 'stock'],
      });
    } catch (error) {
      console.log('🚀 ~ DetailProductService ~ error:', error);

      throw new InternalServerErrorException(error);
    }
  }

  async findOne(id: string): Promise<DetailProduct | null> {
    return await this.detailProduct.findOne({
      where: { id },
      relations: ['product'],
    });
  }

  async findByCategory(category: string) {
    const categoryP = await this.categoryService.findByName(category);

    if (!categoryP) throw new NotFoundException('Category not exist!');

    const variants = await this.detailProduct.find({
      where: {
        product: { category },
      },
      relations: ['product', 'images', 'stock'],
    });

    return variants;
  }

  remove(id: number) {
    return `This action removes a #${id} detailProduct`;
  }
}
