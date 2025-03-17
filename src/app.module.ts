import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './common/database/database.module';
import { CommandeModule } from './commande/commande.module';
import { ConfigModule } from '@nestjs/config';
import { DetailProductModule } from './detail-product/detail-product.module';
import { ReviewModule } from './review/review.module';
import { StockMovementModule } from './stock-movement/stock-movement.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', // The URL path prefix
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
    DatabaseModule,
    ProductModule,
    CategoryModule,
    AuthModule,
    UsersModule,
    CommandeModule,
    DetailProductModule,
    ReviewModule,
    StockMovementModule,
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
