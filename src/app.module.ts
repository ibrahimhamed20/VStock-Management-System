import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './common/config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { InventoryModule } from './inventory/inventory.module';
import { SalesModule } from './sales/sales.module';
import { PurchasingModule } from './purchasing/purchasing.module';
import { AccountingModule } from './accounting/accounting.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { AiModule } from './ai/ai.module';
import { RolesModule } from './users/roles.module';
import { AiAgentModule } from './ai-agent/ai-agent.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
import * as redisStore from 'cache-manager-ioredis';
import { throttlerRedisProvider } from './common/providers/throttler-redis.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        password: configService.get('REDIS_PASSWORD'),
        ttl: 60, // Use ThrottlerModule's TTL
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get('THROTTLER_TTL', 60),
            limit: configService.get('THROTTLER_LIMIT', 20),
            storage: await throttlerRedisProvider.useFactory(),
          },
        ],
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    AuthModule,
    UsersModule,
    ClientsModule,
    InventoryModule,
    SalesModule,
    PurchasingModule,
    AccountingModule,
    ReportsModule,
    SettingsModule,
    AiModule,
    RolesModule,
    // AiAgentModule,
  ],
  controllers: [AppController],
  providers: [
    throttlerRedisProvider,
    AppService,
    {
      provide: ThrottlerGuard,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: 'APP_GUARD',
      useExisting: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
