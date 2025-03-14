/* eslint-disable prettier/prettier */
import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from 'src/entities/review.entity';
import { CreateProductReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ProductService } from 'src/product/product.service';
import { UsersService } from 'src/users/users.service';
import { Users } from 'src/entities/users.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private reviewRepository: Repository<Review>,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    private userService: UsersService,
  ) {}

  async create(user: Users, createReviewDto: CreateProductReviewDto) {
    const { productId, rating, comment } = createReviewDto;

    const getUser = await this.userService.findOne(user.email);

    const product = await this.productService.findOne(productId);

    if (!getUser) throw new NotFoundException(`User not found`);
    if (!product)
      throw new NotFoundException(`Product with ID ${productId} not found`);

    try {
      const review = this.reviewRepository.create({
        user: { id: getUser.id },
        product: { id: productId },
        rating,
        comment,
      });

      const savedReview = await this.reviewRepository.save(review);

      await this.productService.updateProductRating(productId);

      return savedReview;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAll() {
    return this.reviewRepository.find({
      relations: ['user', 'product'],
      order: { reviewDate: 'DESC' },
    });
  }

  async findOne(id: string) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!review) throw new NotFoundException(`Review with ID ${id} not found`);
    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.reviewRepository.findOneBy({ id });
    if (!review) throw new NotFoundException(`Review with ID ${id} not found`);

    Object.assign(review, updateReviewDto);
    return this.reviewRepository.save(review);
  }

  async remove(id: string) {
    const review = await this.reviewRepository.findOneBy({ id });
    if (!review) throw new NotFoundException(`Review with ID ${id} not found`);

    return this.reviewRepository.remove(review);
  }
}
