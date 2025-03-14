import { IsInt, Min, Max, IsString } from 'class-validator';

export class CreateProductReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  comment: string;

  productId: string;
}
