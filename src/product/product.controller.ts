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
  UploadedFiles,
  Patch,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor()) // 'files' must match the form-data field name
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('product-information') productInformation,
    // @Request() req,
  ) {
    // Process files based on colors
    const images = {} as { [color: string]: Express.Multer.File[] };

    files.map((file) => {
      const color = file.fieldname;

      if (color) {
        if (!images[color]) {
          images[color] = [];
        }
        images[color].push(file);
      }
    });

    const { defaultImage, ...res } = images;

    console.log('🚀 ~ ProductController ~ res:', res);

    const data = JSON.parse(productInformation) as CreateProductDto;

    return this.productService.create(data, res, defaultImage);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor()) // 'files' must match the form-data field name
  update(
    @UploadedFiles() files: Express.Multer.File[] = [],
    @Param('id') id: string,
    @Body('product-information') productInformation,
    @Body('removed-images') removedImages,
  ) {
    // Process files based on colors
    const images = {} as { [color: string]: Express.Multer.File[] };

    files.map((file) => {
      const color = file.fieldname;

      if (color) {
        if (!images[color]) {
          images[color] = [];
        }
        images[color].push(file);
      }
    });

    const { defaultImage, ...res } = images;

    const data = JSON.parse(productInformation) as UpdateProductDto;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const removedImagesData = JSON.parse(removedImages);

    return this.productService.update(
      id,
      data,
      res,
      defaultImage,
      removedImagesData,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
