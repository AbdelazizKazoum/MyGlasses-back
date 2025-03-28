/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
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
        total: 0,
      });

      // Step 3: Save the supplier order inside the transaction
      await queryRunner.manager.save(supplierOrder);

      let total = 0; // Initialize total amount

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

          // Calculate subtotal
          const subtotal = item.quantity * item.unitPrice;
          total += subtotal; // Add to total order amount

          // Create the supplier order item
          const supplierOrderItem = this.supplierOrderItemRepo.create({
            order: supplierOrder,
            detail_product: productDetail,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subTotal: subtotal, // Add subtotal to order item
          });

          // Save the order item inside the transaction
          await queryRunner.manager.save(supplierOrderItem);
        },
      );

      // Wait for all order items to be saved
      await Promise.all(orderItemsPromises);

      // Update the supplier order with the total amount
      supplierOrder.total = total;
      await queryRunner.manager.save(supplierOrder);

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
        'supplier_order.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    } else if (startDate) {
      query.andWhere('supplier_order.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('supplier_order.createdAt <= :endDate', { endDate });
    }

    // Filtering by total range
    if (totalMin && totalMin !== undefined) {
      query.andWhere('supplier_order.total >= :totalMin', { totalMin });
    }

    if (totalMax && totalMax !== undefined) {
      query.andWhere('supplier_order.total <= :totalMax', { totalMax });
    }

    // Sorting
    // query.orderBy(
    //   `supplier_order.${sortBy}`,
    //   sortOrder.toUpperCase() as 'ASC' | 'DESC',
    // );

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
    const queryRunner =
      this.supplierOrderRepo.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // Find the existing supplier order
      const supplierOrder = await this.supplierOrderRepo.findOne({
        where: { id },
        relations: ['items', 'supplier'],
      });

      if (!supplierOrder) {
        throw new NotFoundException('Order not found');
      }

      if (
        !updateSupplierOrderDto.items ||
        updateSupplierOrderDto.items.length === 0
      ) {
        throw new NotFoundException('Items are required');
      }

      // Find the supplier
      const supplier = await this.supplierService.findOne(
        updateSupplierOrderDto.supplierId || '',
      );
      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }

      // Update supplier order details
      supplierOrder.supplier = supplier;
      supplierOrder.note = updateSupplierOrderDto.note ?? supplierOrder.note;
      supplierOrder.total = 0; // Reset total before recalculating

      let total = 0;

      // Remove existing order items first to avoid foreign key constraint issues
      await queryRunner.manager.remove(supplierOrder.items);
      supplierOrder.items = [];

      // Step 4: Create new order items and associate them with the supplier order
      for (const item of updateSupplierOrderDto.items) {
        // Find the product detail
        const productDetail = await this.detailProductService.findOne(
          item.productId,
        );

        if (!productDetail) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`,
          );
        }

        // Calculate subtotal
        const subtotal = item.quantity * item.unitPrice;
        total += subtotal; // Add to total order amount

        // Create the supplier order item
        const supplierOrderItem = this.supplierOrderItemRepo.create({
          order: supplierOrder,
          detail_product: productDetail, // Ensure this is correctly assigned
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subTotal: subtotal, // Add subtotal to order item
        });

        // Save the order item inside the transaction
        await queryRunner.manager.save(supplierOrderItem);
        supplierOrder.items.push(supplierOrderItem);
      }

      // Update total and save the updated order
      supplierOrder.total = total;
      await queryRunner.manager.save(supplierOrder);

      await queryRunner.commitTransaction();
      return supplierOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error updating supplier order:', error);
      throw new Error(`Failed to update supplier order: ${error}`);
    } finally {
      await queryRunner.release();
    }
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
