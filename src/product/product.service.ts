/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Repository, DataSource } from 'typeorm';
import { Images } from 'src/entities/images.entity';
import { FileUploadService } from 'src/common/services/file-upload.service';
import { DetailProduct } from 'src/entities/detailProduct.entity';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoryService } from 'src/category/category.service';

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
    private categoryService: CategoryService,

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

  async addProduct(product: CreateProductDto, image: Express.Multer.File) {
    const category = await this.categoryService.findCategoryByLabel(
      product.category,
    );

    if (!category) throw new NotFoundException('Category is not Exits !');

    try {
      const newProduct = this.productRepository.create({
        ...product,
        categoryP: category,
        image: '',
      });

      const saveProduct = await this.productRepository.save(newProduct);

      const uploadPath = `uploads/products/${saveProduct.id}/images/default`;
      const allowedFormats = ['png', 'jpg', 'jpeg', 'PNG'];

      // Upload default image and get its path
      const defaultImagePaths = await this.fileUploadService.uploadFiles(
        [image],
        uploadPath,
        allowedFormats,
      );

      // default image path
      const defaultImagePath = Object.values(defaultImagePaths)[0];

      saveProduct.image = defaultImagePath;

      return await this.productRepository.save(saveProduct);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateProduct(
    id: string,
    product: CreateProductDto,
    image: Express.Multer.File,
  ) {
    const category = await this.categoryService.findCategoryByLabel(
      product.category,
    );

    if (!category) throw new NotFoundException('Category is not Exits !');

    const findProduct = await this.productRepository.findOneBy({ id });

    if (!findProduct) throw new NotFoundException('Product is not exit :');

    try {
      // Merge the updated product details
      Object.assign(findProduct, product);

      if (image) {
        const uploadPath = `uploads/products/${findProduct.id}/images/default`;
        const allowedFormats = ['png', 'jpg', 'jpeg', 'PNG'];

        // Upload default image and get its path
        const defaultImagePaths = await this.fileUploadService.uploadFiles(
          [image],
          uploadPath,
          allowedFormats,
        );

        // default image path
        const defaultImagePath = Object.values(defaultImagePaths)[0];

        findProduct.image = defaultImagePath;
      }

      return await this.productRepository.save(findProduct);
    } catch (error) {
      throw new InternalServerErrorException(error);
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

  async getProductOnly(id: string) {
    return await this.productRepository.findOne({
      where: { id },
    });
  }

  async remove(id: string) {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new InternalServerErrorException(`Product with ID ${id} not found`);
    }
    return { message: `Product #${id} deleted successfully` };
  }

  //------------------- Update Product -----------------------
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    images: { [color: string]: Express.Multer.File[] },
    defaultImage: Express.Multer.File[],
    removesImages: any,
    removedColorsData: string[],
  ) {
    const allowedFormats = ['png', 'jpg', 'jpeg', 'PNG'];

    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Merge the updated product details
    Object.assign(product, updateProductDto);

    // Wrap the whole update process in a transaction
    const queryRunner =
      this.productRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // Handle image removal within the transaction
      if (removesImages) {
        const removalPromises: Promise<any>[] = [];

        for (const key of Object.keys(removesImages)) {
          if (key === 'defaultImage') {
            this.fileUploadService.deleteFile(removesImages[key]);
            removalPromises.push(
              queryRunner.manager.delete(Images, { image: removesImages[key] }),
            );
          } else if (Array.isArray(removesImages[key])) {
            removesImages[key].forEach((image: string) => {
              this.fileUploadService.deleteFile(image);
              removalPromises.push(
                queryRunner.manager.delete(Images, { image }),
              );
            });
          }
        }

        // Wait for all image removals to be completed
        await Promise.all(removalPromises);
      }

      // Handle color removal within the transaction
      if (removedColorsData?.length > 0) {
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from(DetailProduct)
          .where('color IN (:...removedColorsData)', { removedColorsData })
          .andWhere('productId = :id', { id })
          .execute();
      }

      // Handle new default image upload and update product image
      if (defaultImage) {
        const uploadPath = `uploads/products/${product.id}/images/default`;

        // Upload default image and get its path
        const defaultImagePaths = await this.fileUploadService.uploadFiles(
          defaultImage,
          uploadPath,
          allowedFormats,
        );

        const defaultImagePath = Object.values(defaultImagePaths)[0];

        if (defaultImagePath) {
          product.image = defaultImagePath;
        }
      }

      // Handle new images upload for colors and save to the database
      if (images) {
        for (const color of Object.keys(images)) {
          let colorEntity: DetailProduct | null = null;
          let colorUploadPath = '';

          // Create and save detail product for the specific color
          const colorExists = await this.detailProductRepository.findOne({
            where: { color, product },
          });

          if (colorExists) {
            colorEntity = colorExists;
            colorUploadPath = `uploads/products/${product.id}/images/${colorExists.id}`;
          } else {
            console.log('Product ID:', product.id); // Check the product ID

            colorEntity = await queryRunner.manager.save(DetailProduct, {
              color,
              productId: product.id,
            });

            colorUploadPath = `uploads/products/${product.id}/images/${colorEntity.id}`;
          }

          const colorFilePaths = await this.fileUploadService.uploadFiles(
            images[color],
            colorUploadPath,
            allowedFormats,
          );

          const imageEntities = Object.values(colorFilePaths).map((imagePath) =>
            this.imagesRepository.create({
              image: imagePath,
              detailProduct: colorEntity,
            }),
          );

          await queryRunner.manager.save(imageEntities);
        }
      }

      // Save the updated product within the transaction
      await queryRunner.manager.save(product);

      // Commit transaction
      await queryRunner.commitTransaction();

      return product;
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
}
