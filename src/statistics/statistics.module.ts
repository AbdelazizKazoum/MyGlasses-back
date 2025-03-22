/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { Product } from 'src/entities/product.entity';
import { Commande } from 'src/entities/commande.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Product, Commande])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
