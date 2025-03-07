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
import { Commande } from 'src/entities/commande.entity';
import { CommandeDetail } from 'src/entities/commandeDetail.entity';
import { Users } from 'src/entities/users.entity';
import { UpdateCommandeDto } from './dto/update-commande.dto';
import { DetailProductService } from 'src/detail-product/detail-product.service';
import { Stock } from 'src/entities/stock.entity';
import { DataSource } from 'typeorm';

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
    console.log('🚀 ~ Creating Commande:', createCommandeDto);

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
          where: { productDetail: variant },
        });
        // if (!stock || stock.quantity <= 0 || stock.quantity - item.qty < 0) {
        //   throw new InternalServerErrorException(
        //     `Insufficient stock for ${item.name}!`,
        //   );
        // }

        // Reduce stock
        if (!stock) throw new NotFoundException('Not in stock !');
        stock.quantity -= item.qty;
        await queryRunner.manager.save(stock);

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
        statut: 'en attente',
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
      ],
      select: {
        utilisateur: {
          username: true, // Only select the username
        },
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} commande`;
  }

  async update(id: string, updateCommandeDto: UpdateCommandeDto) {
    // Find the commande by ID
    const existingCommande = await this.commandeRepository.findOne({
      where: { id },
      relations: ['details', 'details.detailProduct'], // Include details and products (if needed for total recalculations)
    });

    if (!existingCommande) {
      throw new Error('Commande not found');
    }

    try {
      // Update only the statut and total (if provided)
      if (updateCommandeDto.statut) {
        existingCommande.statut = updateCommandeDto.statut;
      }

      if (updateCommandeDto.newTotal) {
        existingCommande.total = updateCommandeDto.newTotal;
      }

      // Save the updated Commande entity
      return this.commandeRepository.save(existingCommande);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} commande`;
  }
}
