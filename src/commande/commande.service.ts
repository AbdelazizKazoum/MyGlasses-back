/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateCommandeDto } from './dto/create-commande.dto';
// import { UpdateCommandeDto } from './dto/update-commande.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Commande } from 'src/entities/commande.entity';
import { CommandeDetail } from 'src/entities/commandeDetail.entity';
import { Users } from 'src/entities/users.entity';
import { ProductService } from 'src/product/product.service';
import { UpdateCommandeDto } from './dto/update-commande.dto';

@Injectable()
export class CommandeService {
  constructor(
    @InjectRepository(Commande)
    private commandeRepository: Repository<Commande>,
    @InjectRepository(CommandeDetail)
    private commandeDetailRepository: Repository<CommandeDetail>,
    private productService: ProductService,
  ) {}

  async create(createCommandeDto: CreateCommandeDto, user: Users) {
    // Calculate the total by summing up sous_total of all products in the details
    let total = 0;

    for (const item of createCommandeDto.details) {
      const product = await this.productService.findOne(item.id);
      if (product) {
        total += (product.newPrice || product.price) * item.qty;
      }
    }

    // Create new Commande with the calculated total
    const newCommand = this.commandeRepository.create({
      utilisateur: user,
      date_commande: new Date(),
      statut: 'en attente',
      total: total, // Use the calculated total
    });

    // Save the new Commande
    const savedCommande = await this.commandeRepository.save(newCommand);

    // Iterate through the details and create CommandeDetail records
    for (const item of createCommandeDto.details) {
      const product = await this.productService.findOne(item.id);
      if (product) {
        const commandeDetail = this.commandeDetailRepository.create({
          commande: savedCommande,
          product: product,
          prix_vente: product.newPrice || product.price,
          prix_unitaire: product.price,
          quantite: item.qty,
          sous_total: (product.newPrice || product.price) * item.qty,
        });

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

    if (updateCommandeDto.newTotal !== undefined) {
      existingCommande.total = updateCommandeDto.newTotal;
    }

    // Save the updated Commande entity
    return this.commandeRepository.save(existingCommande);
  }

  remove(id: number) {
    return `This action removes a #${id} commande`;
  }
}
