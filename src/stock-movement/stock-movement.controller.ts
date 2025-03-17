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
} from '@nestjs/common';
import { StockMovementService } from './stock-movement.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { Users } from 'src/entities/users.entity';

@Controller('stock-movement')
export class StockMovementController {
  constructor(private readonly stockMovementService: StockMovementService) {}

  @UseGuards(JwtAuthGuard)
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockMovementService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
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
