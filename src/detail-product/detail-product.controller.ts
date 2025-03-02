/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { DetailProductService } from './detail-product.service';
import { CreateDetailProductDto } from './dto/create-detail-product.dto';
import { UpdateDetailProductDto } from './dto/update-detail-product.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('detail-product')
export class DetailProductController {
  constructor(private readonly detailProductService: DetailProductService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('variant') data: string,
  ) {
    const variant = JSON.parse(data) as CreateDetailProductDto;
    console.log('🚀 ~ DetailProductController ~ variant:', variant);
    console.log('🚀 ~ DetailProductController ~ files:', files);

    return variant;
  }

  @Get()
  findAll() {
    return this.detailProductService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detailProductService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDetailProductDto: UpdateDetailProductDto,
  ) {
    return this.detailProductService.update(+id, updateDetailProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detailProductService.remove(+id);
  }
}
