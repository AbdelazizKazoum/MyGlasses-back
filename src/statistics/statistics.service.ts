/* eslint-disable prettier/prettier */
// src/statistics/statistics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commande } from '../entities/commande.entity';
import { Users } from '../entities/users.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Commande)
    private readonly commandeRepo: Repository<Commande>,

    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // 👉 Total orders count
  async getTotalOrders(): Promise<number> {
    return await this.commandeRepo.count();
  }

  // 👉 Total revenue (sum of all orders)
  async getTotalRevenue(): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.commandeRepo
      .createQueryBuilder('commande')
      .select('SUM(commande.total)', 'total')
      .getRawOne();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return parseFloat(result.total) || 0;
  }

  // 👉 Total users count
  async getTotalUsers(): Promise<number> {
    return await this.userRepo.count();
  }

  // 👉 Total products count
  async getTotalProducts(): Promise<number> {
    return await this.productRepo.count();
  }

  // 👉 Monthly Sales Overview (orders & revenue grouped by month)
  async getMonthlySalesOverview(): Promise<
    { month: string; totalRevenue: number; totalOrders: number }[]
  > {
    const results = await this.commandeRepo
      .createQueryBuilder('commande')
      .select("DATE_FORMAT(commande.date_commande, '%Y-%m')", 'month')
      .addSelect('SUM(commande.total)', 'totalRevenue')
      .addSelect('COUNT(commande.id)', 'totalOrders')
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return results.map((r) => ({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      month: r.month,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      totalRevenue: parseFloat(r.totalRevenue),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      totalOrders: parseInt(r.totalOrders),
    }));
  }

  // 👉 Sales distribution (Revenue by product or category)
  async getSalesDistributionByStatus() {
    const result = await this.commandeRepo
      .createQueryBuilder('commande')
      .select('commande.status', 'status')
      .addSelect('SUM(commande.total)', 'totalRevenue')
      .addSelect('COUNT(commande.id)', 'orderCount')
      .groupBy('commande.status')
      .getRawMany();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  }
}
