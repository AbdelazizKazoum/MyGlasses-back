/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CreateSupplierOrderDto } from './dto/create-supplier-order.dto';
import { UpdateSupplierOrderDto } from './dto/update-supplier-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SupplierOrder } from 'src/entities/supplierOrder.entity';
import { Repository } from 'typeorm';
import { SupplierOrderItem } from 'src/entities/supplierOrderItem.entity';
import { SupplierService } from 'src/supplier/supplier.service';
import { DetailProductService } from 'src/detail-product/detail-product.service';
import { FilterSupplierOrderDto } from './dto/FilterSupplierOrderDto';

@Injectable()
export class SupplierOrderService {
  constructor(
    @InjectRepository(SupplierOrder)
    private supplierOrderRepo: Repository<SupplierOrder>,
    @InjectRepository(SupplierOrderItem)
    private supplierOrderItemRepo: Repository<SupplierOrderItem>,
    private supplierService: SupplierService,
    private detailProductService: DetailProductService,
  ) {}

  // Create a new supplier order
  async create(createSupplierOrderDto: CreateSupplierOrderDto) {
    const queryRunner =
      this.supplierOrderRepo.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // Step 1: Find the supplier
      const supplier = await this.supplierService.findOne(
        createSupplierOrderDto.supplierId,
      );
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      // Step 2: Create the supplier order
      const supplierOrder = this.supplierOrderRepo.create({
        supplier,
        note: createSupplierOrderDto.note,
        status: 'pending',
      });

      // Step 3: Save the supplier order inside the transaction
      await queryRunner.manager.save(supplierOrder);

      // Step 4: Create order items and associate with the supplier order
      const orderItemsPromises = createSupplierOrderDto.items.map(
        async (item) => {
          // Find the product
          const productDetail = await this.detailProductService.findOne(
            item.productId,
          );

          if (!productDetail) {
            throw new Error(`Product with ID ${item.productId} not found`);
          }

          // Create the supplier order item
          const supplierOrderItem = this.supplierOrderItemRepo.create({
            order: supplierOrder,
            detail_product: productDetail,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          });

          // Save the order item inside the transaction
          await queryRunner.manager.save(supplierOrderItem);
        },
      );

      // Wait for all order items to be saved
      await Promise.all(orderItemsPromises);

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Return the created order
      return supplierOrder;
    } catch (error) {
      // Rollback the transaction if an error occurs
      await queryRunner.rollbackTransaction();

      // Log the error for better traceability
      console.error('Error creating supplier order:', error);

      // Rethrow the error to be handled at a higher level
      throw new Error(`Failed to create supplier order: ${error}`);
    } finally {
      // Release the query runner (important for avoiding memory leaks)
      await queryRunner.release();
    }
  }

  // Find all orders
  findAll() {
    return this.supplierOrderRepo.find({ relations: ['supplier', 'items'] });
  }

  //-------------------------- Filter and Pagination --------------------------------------

  async getFilteredSupplierOrders(filterDto: FilterSupplierOrderDto) {
    const {
      status,
      supplier,
      startDate,
      endDate,
      totalMin,
      totalMax,
      sortBy = 'date_order',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = filterDto;

    console.log(
      '🚀 ~ SupplierOrderService ~ getFilteredSupplierOrders ~ filterDto:',
      filterDto,
    );

    const query = this.supplierOrderRepo.createQueryBuilder('supplier_order');
    query.leftJoinAndSelect('supplier_order.supplier', 'supplier');
    query.leftJoinAndSelect('supplier_order.items', 'items');
    query.leftJoinAndSelect('items.detail_product', 'detail_product');
    query.leftJoinAndSelect('detail_product.product', 'product');

    // Filtering by status
    if (status) {
      query.andWhere('supplier_order.status = :status', { status });
    }

    // Filtering by supplier name (case-insensitive)
    if (supplier) {
      query.andWhere('LOWER(supplier.name) LIKE :supplier', {
        supplier: `%${supplier.toLowerCase()}%`,
      });
    }

    // Filtering by date range
    if (startDate && endDate) {
      query.andWhere(
        'supplier_order.date_order BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    } else if (startDate) {
      query.andWhere('supplier_order.date_order >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('supplier_order.date_order <= :endDate', { endDate });
    }

    // Filtering by total range
    if (totalMin !== undefined) {
      query.andWhere('supplier_order.total >= :totalMin', { totalMin });
    }

    if (totalMax !== undefined) {
      query.andWhere('supplier_order.total <= :totalMax', { totalMax });
    }

    // Sorting
    query.orderBy(
      `supplier_order.${sortBy}`,
      sortOrder.toUpperCase() as 'ASC' | 'DESC',
    );

    // Pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  //---------------------------------------------------------------------------------

  // Find a single order
  findOne(id: string) {
    return this.supplierOrderRepo.findOne({
      where: { id },
      relations: ['supplier', 'items'],
    });
  }

  // Update an order
  async update(id: string, updateSupplierOrderDto: UpdateSupplierOrderDto) {
    const supplierOrder = await this.supplierOrderRepo.findOne({
      where: { id },
    });
    if (!supplierOrder) {
      throw new Error('Order not found');
    }

    // Update the order details
    const updatedOrder = Object.assign(supplierOrder, updateSupplierOrderDto);
    await this.supplierOrderRepo.save(updatedOrder);

    return updatedOrder;
  }

  // Remove an order
  async remove(id: string) {
    const supplierOrder = await this.supplierOrderRepo.findOne({
      where: { id },
    });
    if (!supplierOrder) {
      throw new Error('Order not found');
    }

    await this.supplierOrderRepo.remove(supplierOrder);
    return { message: `Order ${id} deleted successfully` };
  }
}
