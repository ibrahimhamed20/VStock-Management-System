import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dtos/create-client.dto';
import { UpdateClientDto } from './dtos/update-client.dto';
import { TagClientDto } from './dtos/tag-client.dto';
import { IClient, ITransaction } from './interfaces/client.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async create(@Body() createClientDto: CreateClientDto): Promise<IClient> {
    return await this.clientsService.create(createClientDto);
  }

  @Get()
  async findAll(): Promise<IClient[]> {
    return await this.clientsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IClient> {
    return await this.clientsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<IClient> {
    return await this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return await this.clientsService.remove(id);
  }

  @Post(':id/tags')
  async addTags(
    @Param('id') id: string,
    @Body() tagClientDto: TagClientDto,
  ): Promise<IClient> {
    return await this.clientsService.addTags(id, tagClientDto);
  }

  @Delete(':id/tags')
  async removeTags(
    @Param('id') id: string,
    @Body() tagClientDto: TagClientDto,
  ): Promise<IClient> {
    return await this.clientsService.removeTags(id, tagClientDto);
  }

  @Post(':id/transactions')
  async addTransaction(
    @Param('id') id: string,
    @Body() transaction: ITransaction,
  ): Promise<IClient> {
    return await this.clientsService.addTransaction(id, transaction);
  }

  @Get(':id/transactions')
  async getTransactionHistory(
    @Param('id') id: string,
  ): Promise<ITransaction[]> {
    return await this.clientsService.getTransactionHistory(id);
  }

  @Get('tag/:tag')
  async findByTag(@Param('tag') tag: string): Promise<IClient[]> {
    return await this.clientsService.findByTag(tag);
  }
}
