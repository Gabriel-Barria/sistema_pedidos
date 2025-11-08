import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infrastructure/database/database.module';
import { CacheModule } from './infrastructure/cache/cache.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { TenantMiddleware } from './modules/tenants/tenant.middleware';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import configuration from './config/configuration';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    // Infrastructure modules
    DatabaseModule,
    CacheModule,

    // Feature modules
    HealthModule,
    TenantsModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global JWT Auth Guard - use @Public() decorator to skip
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
