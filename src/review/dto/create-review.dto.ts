/* eslint-disable prettier/prettier */
import { IsInt, Min, Max, IsString } from 'class-validator';
import { Users } from 'src/entities/users.entity';

export class CreateProductReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  comment: string;

  user: Users;
  productId: string;
}
