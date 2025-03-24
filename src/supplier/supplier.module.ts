/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from 'src/entities/supplier.entity';
import { StockMovementModule } from 'src/stock-movement/stock-movement.module';
import { StockMovementService } from 'src/stock-movement/stock-movement.service';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier]), StockMovementModule],
  controllers: [SupplierController],
  providers: [SupplierService, StockMovementService],
  exports: [TypeOrmModule, StockMovementService],
})
export class SupplierModule {}
