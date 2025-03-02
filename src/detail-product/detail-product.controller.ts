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
  BadRequestException,
} from '@nestjs/common';
import { DetailProductService } from './detail-product.service';
import { CreateDetailProductDto } from './dto/create-detail-product.dto';
import { UpdateDetailProductDto } from './dto/update-detail-product.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

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

  @Get('get/:id')
  findAll(@Param('id') id: string) {
    return this.detailProductService.findAll(id);
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
