/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  Patch,
  UploadedFile,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {} from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { FilterProductDto } from './dto/FilterProductDto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add')
  @UseInterceptors(FileInterceptor('file'))
  async addProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body('product') data: string,
  ) {
    const product = JSON.parse(data) as CreateProductDto;

    return await this.productService.addProduct(product, file);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/:id')
  @UseInterceptors(FileInterceptor('file'))
  async updateProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body('product') data: string,
    @Param('id') id: string,
  ) {
    const product = JSON.parse(data) as CreateProductDto;

    return await this.productService.updateProduct(id, product, file);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get('filter')
  async getProductsWithFilter(@Query() filterDto: FilterProductDto) {
    return await this.productService.getFilterdProducts(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Get('category/:category')
  async fetchProductsByCategory(@Param('category') category: string) {
    return await this.productService.findByCategory(category);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
