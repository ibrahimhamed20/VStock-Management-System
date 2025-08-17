import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dtos/create-client.dto';
import { UpdateClientDto } from './dtos/update-client.dto';
import { TagClientDto } from './dtos/tag-client.dto';
import { IClient, ITransaction } from './interfaces/client.interface';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<IClient> {
    const existingClient = await this.clientRepository.findOne({
      where: { email: createClientDto.email },
    });

    if (existingClient) {
      throw new ConflictException('Client with this email already exists');
    }

    const client = this.clientRepository.create(createClientDto);
    return await this.clientRepository.save(client);
  }

  async findAll(): Promise<IClient[]> {
    return await this.clientRepository.find();
  }

  async findOne(id: string): Promise<IClient> {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<IClient> {
    const client = await this.findOne(id);

    if (updateClientDto.email && updateClientDto.email !== client.email) {
      const existingClient = await this.clientRepository.findOne({
        where: { email: updateClientDto.email },
      });
      if (existingClient) {
        throw new ConflictException('Client with this email already exists');
      }
    }

    Object.assign(client, updateClientDto);
    return await this.clientRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    await this.clientRepository.remove(client);
  }

  async addTags(id: string, tagClientDto: TagClientDto): Promise<IClient> {
    const client = await this.findOne(id);
    const newTags = [...new Set([...client.tags, ...tagClientDto.tags])];
    client.tags = newTags;
    return await this.clientRepository.save(client);
  }

  async removeTags(id: string, tagClientDto: TagClientDto): Promise<IClient> {
    const client = await this.findOne(id);
    client.tags = client.tags.filter((tag) => !tagClientDto.tags.includes(tag));
    return await this.clientRepository.save(client);
  }

  async addTransaction(
    id: string,
    transaction: ITransaction,
  ): Promise<IClient> {
    const client = await this.findOne(id);
    client.transactions.push(transaction);
    return await this.clientRepository.save(client);
  }

  async getTransactionHistory(id: string): Promise<ITransaction[]> {
    const client = await this.findOne(id);
    return client.transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  async findByTag(tag: string): Promise<IClient[]> {
    return await this.clientRepository
      .createQueryBuilder('client')
      .where('client.tags LIKE :tag', { tag: `%${tag}%` })
      .getMany();
  }
}
