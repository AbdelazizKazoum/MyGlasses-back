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
    // Create new Commande
    const newCommand = this.commandeRepository.create({
      utilisateur: user,
      date_commande: new Date(),
      statut: 'en attente',
      total: createCommandeDto.total,
    });

    // Save the new Commande
    const savedCommande = await this.commandeRepository.save(newCommand);

    // Iterate through the details (list of products in the order)
    for (const item of createCommandeDto.details) {
      const product = await this.productService.findOne(item.id);

      if (product) {
        const commandeDetail = this.commandeDetailRepository.create({
          commande: savedCommande,
          product: product,
          prix_vente: product.newPrice || product.price, // Price used for the sale (if new price exists, use that)
          prix_unitaire: product.price, // Unit price is the regular price
          quantite: item.qty, // Quantity from the input data
          sous_total: (product.newPrice || product.price) * item.qty, // Subtotal for this product in the order
        });

        // Save the CommandeDetail
        await this.commandeDetailRepository.save(commandeDetail);
      }
    }

    return savedCommande; // Return the saved commande (you can adjust the response based on your need)
  }

  findAll() {
    return `This action returns all commande`;
  }

  findOne(id: number) {
    return `This action returns a #${id} commande`;
  }

  // update(id: number, updateCommandeDto: UpdateCommandeDto) {
  //   return `This action updates a #${id} commande`;
  // }

  remove(id: number) {
    return `This action removes a #${id} commande`;
  }
}
