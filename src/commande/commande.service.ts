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

@Injectable()
export class CommandeService {
  constructor(
    @InjectRepository(Commande)
    private commandeRepository: Repository<Commande>,
    @InjectRepository(CommandeDetail)
    private commandeDetailRepository: Repository<CommandeDetail>,
    private detailProductService: DetailProductService,
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
  ) {}

  async create(createCommandeDto: CreateCommandeDto, user: Users) {
    // Calculate the total by summing up sous_total of all products in the details
    let total = 0;

    for (const item of createCommandeDto.details) {
      const variant = await this.detailProductService.findOne(item.id);

      if (!variant)
        throw new NotFoundException(` Product ${item.name} is not exist !`);

      const { product } = variant;

      if (product) {
        total += (product.newPrice || product.price) * item.quantity;
      } else
        throw new NotFoundException(` Product ${item.name} is not exist !`);
    }
    // Create new Commande with the calculated total
    const newCommand = this.commandeRepository.create({
      utilisateur: user,
      date_commande: new Date(),
      statut: 'en attente',
      total: total, // Use the calculated total
      address: createCommandeDto?.address,
    });

    // Save the new Commande
    const savedCommande = await this.commandeRepository.save(newCommand);

    // Iterate through the details and create CommandeDetail records
    for (const item of createCommandeDto.details) {
      const variant = await this.detailProductService.findOne(item.id);
      if (!variant) throw new NotFoundException();
      const { product } = variant;

      const availableQte = await this.stockRepository.findOne({
        where: { productDetail: variant },
      });

      if (!availableQte)
        throw new InternalServerErrorException('Qte is not available ! ');

      if (
        (availableQte?.quantity && availableQte?.quantity <= 0) ||
        availableQte?.quantity - item.quantity < 0
      )
        throw new InternalServerErrorException('Qte is not available ! ');

      availableQte.quantity = availableQte.quantity - item.quantity;

      if (!product) throw new NotFoundException();
      if (variant) {
        const commandeDetail = this.commandeDetailRepository.create({
          commande: savedCommande,
          detailProduct: variant,
          prix_vente: product.newPrice || product.price,
          prix_unitaire: product.price,
          quantite: item.quantity,
          sous_total: (product.newPrice || product.price) * item.quantity,
        });

        await this.stockRepository.save(availableQte);

        // Save the CommandeDetail
        await this.commandeDetailRepository.save(commandeDetail);
      }
    }

    return savedCommande; // Return the saved commande
  }

  findAll() {
    return this.commandeRepository.find({
      relations: ['details.product', 'utilisateur'],
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
      relations: ['details', 'details.product'], // Include details and products (if needed for total recalculations)
    });

    if (!existingCommande) {
      throw new Error('Commande not found');
    }

    // Update only the statut and total (if provided)
    if (updateCommandeDto.statut) {
      existingCommande.statut = updateCommandeDto.statut;
    }

    if (updateCommandeDto.newTotal) {
      existingCommande.total = updateCommandeDto.newTotal;
    }

    // Save the updated Commande entity
    return this.commandeRepository.save(existingCommande);
  }

  remove(id: number) {
    return `This action removes a #${id} commande`;
  }
}
