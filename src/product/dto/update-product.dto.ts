import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
// import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
