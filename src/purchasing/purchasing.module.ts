import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasingController } from './purchasing.controller';
import { PurchasingService } from './purchasing.service';
import { Purchase } from './entities/purchase.entity';
import { PurchaseItem } from './entities/purchase-item.entity';
import { Supplier } from './entities/supplier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, PurchaseItem, Supplier])],
  controllers: [PurchasingController],
  providers: [PurchasingService],
  exports: [PurchasingService],
})
export class PurchasingModule {}
