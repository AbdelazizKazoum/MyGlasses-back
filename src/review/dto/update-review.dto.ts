/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductReviewDto } from './create-review.dto';

export class UpdateReviewDto extends PartialType(CreateProductReviewDto) {}
