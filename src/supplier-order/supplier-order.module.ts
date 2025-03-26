/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { SupplierOrderService } from './supplier-order.service';
import { SupplierOrderController } from './supplier-order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierOrder } from 'src/entities/supplierOrder.entity';
import { SupplierOrderItem } from 'src/entities/supplierOrderItem.entity';
import { DetailProductModule } from 'src/detail-product/detail-product.module';
import { SupplierModule } from 'src/supplier/supplier.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupplierOrder, SupplierOrderItem]),
    DetailProductModule,
    SupplierModule,
  ],
  controllers: [SupplierOrderController],
  providers: [SupplierOrderService],
})
export class SupplierOrderModule {}
