/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CommandeService } from './commande.service';
import { CommandeController } from './commande.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commande } from 'src/entities/commande.entity';
import { CommandeDetail } from 'src/entities/commandeDetail.entity';
import { ProductModule } from 'src/product/product.module';
import { ProductService } from 'src/product/product.service';
import { SharedModule } from 'src/common/services/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Commande, CommandeDetail]),
    ProductModule,
    SharedModule,
  ],
  controllers: [CommandeController],
  providers: [CommandeService, ProductService],
})
export class CommandeModule {}
