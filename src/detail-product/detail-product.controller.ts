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
} from '@nestjs/common';
import { DetailProductService } from './detail-product.service';
import { CreateDetailProductDto } from './dto/create-detail-product.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UpdateDetailProductDto } from './dto/update-detail-product.dto';

@Controller('detail-product')
export class DetailProductController {
  constructor(private readonly detailProductService: DetailProductService) {}

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
  findAll(@Param('id') id: string) {
    return this.detailProductService.findAll(id);
  }

  @Get('stock/:id')
  getStock(@Param('id') id: string) {
    return this.detailProductService.getStock(id);
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
