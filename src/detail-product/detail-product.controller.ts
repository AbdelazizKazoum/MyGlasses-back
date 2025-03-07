/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { DetailProductService } from './detail-product.service';
import { CreateDetailProductDto } from './dto/create-detail-product.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UpdateDetailProductDto } from './dto/update-detail-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';

@Controller('detail-product')
export class DetailProductController {
  constructor(private readonly detailProductService: DetailProductService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add/:id')
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('variant') data: string,
    @Param('id') id: string,
  ) {
    if (!data && !id) throw new BadRequestException('Invalid data !');

    const variant = JSON.parse(data) as CreateDetailProductDto;

    return this.detailProductService.create(id, variant, files);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/:id')
  @UseInterceptors(AnyFilesInterceptor())
  async update(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('variant') data: string,
    @Body('removedImages') removeData: string,
    @Param('id') id: string,
  ) {
    if (!data && !id) throw new BadRequestException('Invalid data !');

    const variant = JSON.parse(data) as UpdateDetailProductDto;

    const removedImages = removeData
      ? (JSON.parse(removeData) as string[])
      : [];

    return await this.detailProductService.update(
      id,
      variant,
      files,
      removedImages,
    );
  }

  @Get('get/:id')
  async findAll(@Param('id') id: string) {
    return await this.detailProductService.findAll(id);
  }

  @Get('stock/:id')
  async getStock(@Param('id') id: string) {
    return await this.detailProductService.getStock(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('stock/:id')
  async updateStock(@Body('qty') qty: number, @Param('id') id: string) {
    console.log('🚀 ~ DetailProductController ~ updateStock ~ qty:', qty);

    return await this.detailProductService.updateStock(id, qty);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detailProductService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detailProductService.remove(+id);
  }
}
