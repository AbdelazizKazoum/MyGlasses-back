/* eslint-disable prettier/prettier */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Repository } from 'typeorm';
import { FileUploadService } from 'src/common/services/file-upload.service';
import { CategoryService } from 'src/category/category.service';
import { FilterProductDto } from './dto/FilterProductDto';
import { Review } from 'src/entities/review.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,

    private fileUploadService: FileUploadService,
    private categoryService: CategoryService,
    // @Inject(forwardRef(() => ReviewService))
    // private readonly reviewService: ReviewService,
  ) {}

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
      relations: ['detail', 'detail.images', 'detail.stock'],
    });
  }

  async getFilterdProducts(filterDto: FilterProductDto) {
    const {
      searchInput,
      gender,
      category,
      priceRange,
      rating,
      priceSort,
      brand,
      page = 1,
      limit = 10,
    } = filterDto;

    const query = this.productRepository.createQueryBuilder('product');

    // Join category and detail product
    query.leftJoinAndSelect('product.categoryP', 'categoryP');
    query.leftJoinAndSelect('product.detail', 'detail');
    query.leftJoinAndSelect('detail.images', 'images');
    query.leftJoinAndSelect('detail.stock', 'stock');

    // 🔍 Search filter
    if (searchInput) {
      query.andWhere('LOWER(product.name) LIKE :search', {
        search: `%${searchInput.toLowerCase()}%`,
      });
    }

    // 🧍 Gender filter
    if (gender && gender !== 'All') {
      query.andWhere('product.gender = :gender', { gender });
    }

    // 📂 Category filter
    if (category && category.length > 0) {
      query.andWhere('product.category IN (:...category)', { category });
    }

    // 📂 Category filter
    if (brand && brand !== 'All') {
      query.andWhere('LOWER(product.brand) LIKE :brand', {
        brand: `%${brand.toLowerCase()}%`,
      });
    }

    // 💸 Price range filter
    if (priceRange && priceRange < 4999) {
      query.andWhere('(product.newPrice <= :priceRange)', { priceRange });
    }

    // ⭐ Rating filter
    if (rating) {
      query.andWhere('product.rating >= :rating', { rating });
    }

    // ↕️ Sorting
    if (priceSort === 'LOW_HIGH') {
      query.orderBy('product.newPrice', 'ASC');
    } else if (priceSort === 'HIGH_LOW') {
      query.orderBy('product.newPrice', 'DESC');
    } else {
      query.orderBy('product.createAt', 'DESC');
    }

    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    // 🧮 Get results and total count
    const [products, total] = await query.getManyAndCount();

    return {
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Product | null> {
    return await this.productRepository.findOne({
      where: { id },
      relations: ['detail', 'detail.images', 'detail.stock'],
    });
  }

  async findByCategory(category: string) {
    return await this.productRepository.find({
      where: [{ categoryP: { displayText: category } }, { category: category }],
      relations: ['detail', 'detail.images'],
    });
  }

  async getProductOnly(id: string): Promise<Product | null> {
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

  async updateProductRating(productId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['reviews'],
    });

    if (!product) throw new NotFoundException('Product not found');

    const reviews = await this.reviewRepository.find({
      where: { product: { id: productId } },
    });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    product.rating = parseFloat(averageRating.toFixed(2));
    product.reviewCount = totalReviews;

    await this.productRepository.save(product);
  }
}
