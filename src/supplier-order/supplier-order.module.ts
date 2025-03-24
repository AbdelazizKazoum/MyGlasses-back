import { Module } from '@nestjs/common';
import { SupplierOrderService } from './supplier-order.service';
import { SupplierOrderController } from './supplier-order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierOrder } from 'src/entities/supplierOrder.entity';
import { SupplierOrderItem } from 'src/entities/supplierOrderItem.entity';
import { DetailProductModule } from 'src/detail-product/detail-product.module';
import { DetailProductService } from 'src/detail-product/detail-product.service';
import { SupplierModule } from 'src/supplier/supplier.module';
import { SupplierService } from 'src/supplier/supplier.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupplierOrder, SupplierOrderItem]),
    DetailProductModule,
    SupplierModule,
  ],
  controllers: [SupplierOrderController],
  providers: [SupplierOrderService, DetailProductService, SupplierService],
})
export class SupplierOrderModule {}
