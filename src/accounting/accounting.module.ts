import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';
import {
  JournalEntry,
  JournalEntryLine,
} from './entities/journal-entry.entity';
import { Account } from './entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, JournalEntry, JournalEntryLine]),
  ],
  controllers: [AccountingController],
  providers: [AccountingService],
  exports: [AccountingService],
})
export class AccountingModule {}
