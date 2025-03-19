/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { StockMovementService } from './stock-movement.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { Users } from 'src/entities/users.entity';
import { FilterStockMovementDto } from './dto/filterStockMovementDto.dto';
import { FilterStockDto } from './dto/filterStockDto';

@UseGuards(JwtAuthGuard)
@Controller('stock-movement')
export class StockMovementController {
  constructor(private readonly stockMovementService: StockMovementService) {}

  @Post()
  async create(
    @Body() createStockMovementDto: CreateStockMovementDto,
    @Req() req: Request,
  ) {
    const user = req.user as Users;

    return await this.stockMovementService.create(createStockMovementDto, user);
  }

  @Get()
  findAll() {
    return this.stockMovementService.findAll();
  }

  @Get('filter')
  async getStockMovementWIthFilter(@Query() filterDto: FilterStockMovementDto) {
    return await this.stockMovementService.getFilteredStockMovements(filterDto);
  }

  @Get('stock/filter')
  async getStockFilter(@Query() filterDto: FilterStockDto) {
    return await this.stockMovementService.getFilteredStock(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockMovementService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStockMovementDto: UpdateStockMovementDto,
    @Req() req: Request,
  ) {
    const user = req.user as Users;
    if (!user) throw new UnauthorizedException();

    return this.stockMovementService.update(id, user, updateStockMovementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockMovementService.remove(id);
  }
}
