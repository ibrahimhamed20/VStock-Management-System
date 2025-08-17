import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { Product } from './entities/product.entity';
import { Batch } from './entities/batch.entity';
import { StockMovement } from './entities/stock-movement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Batch, StockMovement])],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
