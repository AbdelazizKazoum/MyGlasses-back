/* eslint-disable prettier/prettier */
import { IsInt, Min, Max, IsString } from 'class-validator';

export class CreateProductReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  title: string;

  @IsString()
  comment: string;

  @IsString()
  productId: string;
}
