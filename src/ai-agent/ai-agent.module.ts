import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "@nestjs/cache-manager";
import { Role, UserLoginHistory, User } from "../users/entities";
import { Product, Batch, StockMovement } from "../inventory/entities";
import { Client } from "../clients/entities/client.entity";
import { Account } from "../accounting/entities/account.entity";
import { JournalEntry, JournalEntryLine } from "../accounting/entities/journal-entry.entity";
import { ConversationService, SyncService, AdminService } from "./services";
import { EmbeddingsModule } from "./modules/embeddings.module";
import { VectorStoreModule } from "./modules/vector-store.module";
import { LlmModule } from "./modules/llm.module";
import { AiAdminPanelController, ConversationsController } from "./controllers";
import { Conversation, Message, SyncStatusEntity } from "./entities";
import { AiAgentController } from "./ai-agent.controller";
import { AiAgentService } from "./ai-agent.service";
import { UsersService } from "../users/services/users.service";
import { ClientsService } from "../clients/clients.service";
import { InventoryService } from "../inventory/inventory.service";
import { AccountingService } from "../accounting/accounting.service";
import { MailerService } from "../common/services/mailer.service";
import { SalesModule } from "../sales/sales.module";
import { PurchasingModule } from "../purchasing/purchasing.module";

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    ConfigModule,
    PurchasingModule,
    SalesModule,
    // Add cache module for AI Agent performance optimization
    CacheModule.register({
      ttl: 5 * 60 * 1000, // 5 minutes default TTL
      max: 1000, // Maximum number of items in cache
    }),
    TypeOrmModule.forFeature([
      User,
      Role,
      UserLoginHistory,
      Client,
      Product,
      Batch,
      StockMovement,
      Account,
      JournalEntry,
      JournalEntryLine,
      Conversation,
      Message,
      SyncStatusEntity
    ]),
    // Properly ordered modules for dependency management
    EmbeddingsModule,
    VectorStoreModule,
    LlmModule,
  ],
  controllers: [AiAgentController, AiAdminPanelController, ConversationsController],
  providers: [
    AiAgentService,
    AdminService,
    UsersService,
    ClientsService,
    InventoryService,
    AccountingService,
    MailerService,
    SyncService,
    ConversationService,
  ],
  exports: [AiAgentService],
})
export class AiAgentModule { } 