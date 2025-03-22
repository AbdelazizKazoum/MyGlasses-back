/* eslint-disable prettier/prettier */
import { Controller, Get } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  async getAllStats() {
    const [orders, revenue, users, products, overview, distribution] =
      await Promise.all([
        this.statisticsService.getTotalOrders(),
        this.statisticsService.getTotalRevenue(),
        this.statisticsService.getTotalUsers(),
        this.statisticsService.getTotalProducts(),
        this.statisticsService.getMonthlySalesOverview(),
        this.statisticsService.getSalesDistributionByStatus(),
      ]);

    return {
      totalOrders: orders,
      totalRevenue: revenue,
      totalUsers: users,
      totalProducts: products,
      salesOverview: overview,
      salesDistribution: distribution,
    };
  }
}
