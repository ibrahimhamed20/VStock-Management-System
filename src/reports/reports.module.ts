import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { AccountingModule } from '../accounting/accounting.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [AccountingModule, SettingsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
