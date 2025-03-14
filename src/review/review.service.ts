/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from 'src/entities/review.entity';
import { CreateProductReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UsersService } from 'src/users/users.service';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private reviewRepository: Repository<Review>,
    private userService: UsersService,
    private productService: ProductService,
  ) {}

  async create(createReviewDto: CreateProductReviewDto) {
    const { user, productId, rating, comment } = createReviewDto;

    const getUser = await this.userService.findOne(user.email);
    const product = await this.productService.findOne(productId);

    if (!getUser)
      throw new NotFoundException(`User with ID ${getUser} not found`);
    if (!product)
      throw new NotFoundException(`Product with ID ${productId} not found`);

    const review = this.reviewRepository.create({
      user,
      product,
      rating,
      comment,
    });

    return this.reviewRepository.save(review);
  }

  async findAll() {
    return this.reviewRepository.find({
      relations: ['user', 'product'],
      order: { reviewDate: 'DESC' },
    });
  }

  async ProductRatings(productId: string) {
    return this.reviewRepository.find({
      where: { product: { id: productId } },
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
