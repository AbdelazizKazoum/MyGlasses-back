/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement } from 'src/entities/stockMovement.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';
import { Stock } from 'src/entities/stock.entity';
import { StockMovementType } from 'src/types/stock-movement-type.enum';
import { Users } from 'src/entities/users.entity';
import { DetailProductService } from 'src/detail-product/detail-product.service';
import { FilterStockMovementDto } from './dto/filterStockMovementDto.dto';
import { FilterStockDto } from './dto/filterStockDto';

@Injectable()
export class StockMovementService {
  constructor(
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    private detailProductService: DetailProductService,
  ) {}

  // Create a new stock movement
  async create(createDto: CreateStockMovementDto, user: Users) {
    const {
      type,
      quantity,
      productDetailId,
      supplierId,
      supplierOrderId,
      reason,
      note,
    } = createDto;

    const productDetail =
      await this.detailProductService.findOne(productDetailId);
    if (!productDetail) throw new NotFoundException('Product detail not found');

    // Handle stock and stock movement within a transaction for consistency
    return await this.stockMovementRepository.manager.transaction(
      async (transactionalEntityManager) => {
        let stock = await transactionalEntityManager.findOne(Stock, {
          where: { productDetail: { id: productDetailId } },
          relations: ['productDetail'],
        });

        if (!stock) {
          stock = transactionalEntityManager.create(Stock, {
            productDetail,
            quantity: 0,
          });
          stock = await transactionalEntityManager.save(stock);
        }

        // Handle stock movement and update stock
        stock = await this.handleStockMovement(stock, type, quantity);

        // Create the stock movement record
        const stockMovement = transactionalEntityManager.create(StockMovement, {
          productDetail,
          type,
          quantity,
          reason,
          note,
          user: user,
          supplier: supplierId ? { id: supplierId } : null,
          supplierOrder: supplierOrderId ? { id: supplierOrderId } : null,
        });

        // Save stock movement
        await transactionalEntityManager.save(stockMovement);
        return stockMovement;
      },
    );
  }

  // Handle stock movement (ADD, REMOVE, CORRECTION)
  private async handleStockMovement(
    stock: Stock,
    type: StockMovementType,
    quantity: number,
  ): Promise<Stock> {
    switch (type) {
      case StockMovementType.ADD:
        stock.quantity += quantity;
        break;
      case StockMovementType.REMOVE:
        if (stock.quantity < quantity) {
          throw new BadRequestException('Not enough stock for this movement');
        }
        stock.quantity -= quantity;
        break;
      case StockMovementType.CORRECTION:
        stock.quantity = quantity; // Set the stock to the new value in case of correction
        break;
      default:
        throw new BadRequestException('Invalid stock movement type');
    }

    // Save updated stock
    return await this.stockRepository.save(stock);
  }

  // Other methods: findAll, findOne, update, remove
  findAll() {
    return this.stockMovementRepository.find();
  }

  // Get stock movement with pagination and filter
  async getFilteredStockMovements(filterDto: FilterStockMovementDto) {
    const {
      searchInput,
      type,
      reason,
      supplierId,
      // productDetailId,
      page = 1,
      limit = 10,
    } = filterDto;
    console.log(
      '🚀 ~ StockMovementService ~ getFilteredStockMovements ~ filterDto:',
      filterDto,
    );

    const query = this.stockMovementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.productDetail', 'productDetail')
      .leftJoinAndSelect('productDetail.product', 'product') // 🆕 Join the product
      .leftJoinAndSelect('movement.supplier', 'supplier')
      .leftJoinAndSelect('movement.user', 'user')
      .leftJoinAndSelect('movement.supplierOrder', 'supplierOrder');

    // 🔍 Search: by note or product name
    if (searchInput) {
      query.andWhere(
        `(LOWER(movement.note) LIKE :search OR LOWER(product.name) LIKE :search)`,
        { search: `%${searchInput.toLowerCase()}%` },
      );
    }

    // 📦 Filter by Type
    if (type) {
      query.andWhere('movement.type = :type', { type });
    }

    // 📝 Filter by Reason
    if (reason) {
      query.andWhere('movement.reason = :reason', { reason });
    }

    // 🔗 Filter by Supplier
    if (supplierId) {
      query.andWhere('supplier.id = :supplierId', { supplierId });
    }

    // // 🔗 Filter by Product Detail
    // if (productDetailId) {
    //   query.andWhere('productDetail.id = :productDetailId', {
    //     productDetailId,
    //   });
    // }

    // 📅 Sort by latest first
    query.orderBy('movement.createdAt', 'DESC');

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [result, total] = await query.getManyAndCount();

    return {
      data: result,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Add this method in your StockMovementService

  // Get filtered stock with pagination
  async getFilteredStock(filterDto: FilterStockDto) {
    const {
      searchInput,
      size,
      quantity,
      productDetailId,
      createdAt,
      updatedAt,
      page = 1,
      limit = 10,
    } = filterDto;
    console.log(
      '🚀 ~ StockMovementService ~ getFilteredStock ~ filterDto:',
      filterDto,
    );

    const query = this.stockRepository
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.productDetail', 'productDetail')
      .leftJoinAndSelect('productDetail.product', 'product'); // 🆕 Join the product

    // 🔍 Search: by product name or product detail
    if (searchInput) {
      query.andWhere(
        `(LOWER(product.name) LIKE :search OR LOWER(product.description) LIKE :search)`,
        { search: `%${searchInput.toLowerCase()}%` },
      );
    }

    // 📦 Filter by quantity, if it's provided
    if (quantity) {
      console.log(
        '🚀 ~ StockMovementService ~ getFilteredStock ~ quantity:',
        quantity,
      );

      query.andWhere('stock.quantity = :quantity', { quantity });
    }

    // 🔗 Filter by Product Detail, if it's provided
    if (productDetailId) {
      query.andWhere('productDetail.id = :productDetailId', {
        productDetailId,
      });
    }

    // 🔗 Filter by Product Detail, if it's provided
    if (size) {
      query.andWhere('productDetail.size = :size', {
        size,
      });
    }

    // 📅 Filter by created date, if it's provided
    if (createdAt) {
      query.andWhere('stock.createAt >= :createdAt', { createdAt });
    }

    // 📅 Filter by updated date, if it's provided
    if (updatedAt) {
      query.andWhere('stock.updated >= :updatedAt', { updatedAt });
    }

    // 📅 Sort by latest first (or any sorting you prefer)
    query.orderBy('stock.createAt', 'DESC');

    // Pagination logic
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    // Execute the query and get the results
    const [result, total] = await query.getManyAndCount();

    return {
      data: result,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  findOne(id: string) {
    return this.stockMovementRepository.findOne({ where: { id } });
  }

  async update(id: string, user: Users, updateDto: UpdateStockMovementDto) {
    const stockMovement = await this.stockMovementRepository.findOne({
      where: { id },
    });
    if (!stockMovement) throw new NotFoundException('Stock movement not found');

    // Update fields
    if (updateDto.type) stockMovement.type = updateDto.type;
    if (updateDto.quantity) stockMovement.quantity = updateDto.quantity;
    if (updateDto.reason) stockMovement.reason = updateDto.reason;
    if (updateDto.userId) stockMovement.user = user;

    return this.stockMovementRepository.save(stockMovement);
  }

  async remove(id: string) {
    const stockMovement = await this.stockMovementRepository.findOne({
      where: { id },
    });
    if (!stockMovement) throw new NotFoundException('Stock movement not found');

    return this.stockMovementRepository.remove(stockMovement);
  }
}
