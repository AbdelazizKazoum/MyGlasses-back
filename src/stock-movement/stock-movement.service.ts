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
