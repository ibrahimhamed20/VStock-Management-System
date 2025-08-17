import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService, ExternalAiService } from './ai.service';

@Module({
  controllers: [AiController],
  providers: [AiService, ExternalAiService],
  exports: [AiService],
})
export class AiModule {}
