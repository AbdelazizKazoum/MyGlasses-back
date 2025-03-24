/* eslint-disable prettier/prettier */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateCommandeDto } from './dto/create-commande.dto';
// import { UpdateCommandeDto } from './dto/update-commande.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Commande,
  OrderStatus,
  PaymentStatus,
} from 'src/entities/commande.entity';
import { CommandeDetail } from 'src/entities/commandeDetail.entity';
import { Users } from 'src/entities/users.entity';
import { UpdateCommandeDto } from './dto/update-commande.dto';
import { DetailProductService } from 'src/detail-product/detail-product.service';
import { Stock } from 'src/entities/stock.entity';
import { DataSource } from 'typeorm';
import { FilterCommandeDto } from './dto/FilterCommandDto';

@Injectable()
export class CommandeService {
  constructor(
    @InjectRepository(Commande)
    private commandeRepository: Repository<Commande>,
    private readonly dataSource: DataSource, // Inject TypeORM's DataSource for transactions

    @InjectRepository(CommandeDetail)
    private commandeDetailRepository: Repository<CommandeDetail>,
    private detailProductService: DetailProductService,
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
  ) {}

  async create(createCommandeDto: CreateCommandeDto, user: Users) {
    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let total = 0;
      const commandeDetails = [] as CommandeDetail[];

      // Validate and prepare data
      for (const item of createCommandeDto.details) {
        const variant = await this.detailProductService.findOne(item.id);
        if (!variant)
          throw new NotFoundException(`Product ${item.name} does not exist!`);

        const { product } = variant;
        if (!product)
          throw new NotFoundException(`Product ${item.name} does not exist!`);

        const price = product.newPrice ?? product.price;
        if (typeof price !== 'number' || isNaN(price)) {
          throw new Error(`Invalid price for product ${item.name}: ${price}`);
        }

        if (!Number.isFinite(item.qty)) {
          throw new Error(
            `Invalid quantity for product ${item.name}: ${item.qty}`,
          );
        }

        total += price * item.qty;

        // Get stock and validate quantity
        const stock = await this.stockRepository.findOne({
          where: { productDetail: { id: item.id } },
        });
        if (!stock || stock.quantity <= 0 || stock.quantity - item.qty < 0) {
          throw new InternalServerErrorException(
            `Insufficient stock for ${item.name}!`,
          );
        }

        // Reduce stock | !Impartant : this is replaced to the command status update when sets to delivered
        // stock.quantity -= item.qty;
        // await queryRunner.manager.save(stock);

        // Prepare commande detail
        commandeDetails.push({
          detailProduct: variant,
          prix_vente: price,
          prix_unitaire: product.price,
          quantite: item.qty,
          sous_total: price * item.qty,
        });
      }

      // Create and save Commande
      const newCommande = this.commandeRepository.create({
        utilisateur: user,
        date_commande: new Date(),
        total,
        address: createCommandeDto.address,
      });

      const savedCommande = await queryRunner.manager.save(newCommande);

      // Save Commande Details
      for (const detail of commandeDetails) {
        const commandeDetail = this.commandeDetailRepository.create({
          ...detail,
          commande: savedCommande,
        });

        await queryRunner.manager.save(commandeDetail);
      }

      // Commit transaction
      await queryRunner.commitTransaction();
      return savedCommande;
    } catch (error) {
      // Rollback transaction in case of failure
      await queryRunner.rollbackTransaction();
      console.error('🚨 Error creating Commande:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return this.commandeRepository.find({
      relations: [
        'details.detailProduct.product',
        'details.detailProduct.images',
        'utilisateur',
        'address',
      ],
      select: {
        utilisateur: {
          username: true, // Only select the username
        },
      },
    });
  }

  //-------------------------- Filter commands --------------------------------------
  async getFilteredCommandes(filterDto: FilterCommandeDto) {
    const {
      status,
      paymentStatus,
      user,
      startDate,
      endDate,
      totalMin,
      totalMax,
      sortBy = 'date_commande',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = filterDto;
    console.log(
      '🚀 ~ CommandeService ~ getFilteredCommandes ~ filterDto:',
      filterDto,
    );

    const query = this.commandeRepository.createQueryBuilder('commande');

    query.leftJoinAndSelect('commande.utilisateur', 'utilisateur');
    query.leftJoinAndSelect('commande.details', 'details');
    query.leftJoinAndSelect('details.detailProduct', 'detailProduct');

    query.leftJoinAndSelect('detailProduct.product', 'product');
    query.leftJoinAndSelect('detailProduct.images', 'images');

    query.leftJoinAndSelect('commande.address', 'address');
    query.leftJoinAndSelect('commande.paiement', 'paiement');

    if (status) {
      query.andWhere('commande.status = :status', { status });
    }

    if (paymentStatus) {
      query.andWhere('commande.paymentStatus = :paymentStatus', {
        paymentStatus,
      });
    }

    if (user) {
      query.andWhere('LOWER(utilisateur.username) LIKE :user', {
        user: `%${user.toLowerCase()}%`,
      });
    }

    if (startDate && endDate) {
      query.andWhere('commande.date_commande BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere('commande.date_commande >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('commande.date_commande <= :endDate', { endDate });
    }

    if (totalMin && totalMin !== undefined) {
      query.andWhere('commande.total >= :totalMin', { totalMin });
    }

    if (totalMax && totalMax !== undefined) {
      query.andWhere('commande.total <= :totalMax', { totalMax });
    }

    // Sorting
    query.orderBy(
      `commande.${sortBy}`,
      sortOrder.toUpperCase() as 'ASC' | 'DESC',
    );

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

  findOne(id: number) {
    return `This action returns a #${id} commande`;
  }

  getLatest() {
    try {
      return this.commandeRepository.find({
        relations: [
          'details.detailProduct.product',
          'details.detailProduct.images',
          'utilisateur',
          'address',
        ],
        select: {
          utilisateur: {
            username: true,
          },
        },
        order: {
          date_commande: 'DESC', // Make sure you have a 'createdAt' column
        },
        take: 10, // Limit to the latest 10
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async update(id: string, updateCommandeDto: UpdateCommandeDto) {
    // Start a transation
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Find the commande by ID
    const existingCommande = await this.commandeRepository.findOne({
      where: { id },
      relations: [
        'details',
        'details.detailProduct',
        'details.detailProduct.product',
      ], // Include details and products (if needed for total recalculations)
    });

    if (!existingCommande) {
      throw new Error('Commande not found');
    }

    try {
      // Update only the statut and total (if provided)
      if (updateCommandeDto.total) {
        existingCommande.total = updateCommandeDto.total;
      }
      if (updateCommandeDto.status) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        existingCommande.status = updateCommandeDto.status;
        if (updateCommandeDto.status == OrderStatus.DELIVERED) {
          existingCommande.paymentStatus = PaymentStatus.PAID;

          // Validate and prepare data
          for (const item of existingCommande.details) {
            // Get stock and validate quantity
            const stock = await this.stockRepository.findOne({
              where: { productDetail: item.detailProduct },
            });
            if (
              !stock ||
              stock.quantity <= 0 ||
              stock.quantity - item.quantite < 0
            ) {
              console.log('🚀 ~ CommandeService ~ update ~ stock:', stock);

              throw new InternalServerErrorException(
                `Insufficient stock for ${item.detailProduct.product.name}!`,
              );
            }

            // Reduce stock
            stock.quantity -= item.quantite;
            await queryRunner.manager.save(stock);
          }
        }
      }

      if (updateCommandeDto.newTotal) {
        existingCommande.total = updateCommandeDto.newTotal;
      }

      // Save the updated Commande entity
      const updatedCommand = await queryRunner.manager.save(existingCommande);

      await queryRunner.commitTransaction();

      return updatedCommand;
    } catch (error) {
      console.log('🚀 ~ CommandeService ~ update ~ error:', error);

      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      await queryRunner.release();
    }
  }

  remove(id: number) {
    return `This action removes a #${id} commande`;
  }
}
