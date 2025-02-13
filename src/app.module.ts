/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './common/database/database.module';

@Module({
  imports: [
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
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
