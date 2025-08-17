import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientsService } from '../clients.service';
import { Client } from '../entities/client.entity';
import { CreateClientDto } from '../dtos/create-client.dto';
import { UpdateClientDto } from '../dtos/update-client.dto';
import { TagClientDto } from '../dtos/tag-client.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ClientsService', () => {
  let service: ClientsService;
  let repository: Repository<Client>;

  const mockClient = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    tags: [],
    transactions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(Client),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    repository = module.get<Repository<Client>>(getRepositoryToken(Client));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a client successfully', async () => {
      const createClientDto: CreateClientDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(mockClient);
      jest.spyOn(repository, 'save').mockResolvedValue(mockClient);

      const result = await service.create(createClientDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: createClientDto.email },
      });
      expect(repository.create).toHaveBeenCalledWith(createClientDto);
      expect(repository.save).toHaveBeenCalledWith(mockClient);
      expect(result).toEqual(mockClient);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createClientDto: CreateClientDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockClient);

      await expect(service.create(createClientDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all clients', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([mockClient]);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([mockClient]);
    });
  });

  describe('findOne', () => {
    it('should return a client by id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockClient);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockClient);
    });

    it('should throw NotFoundException if client not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a client successfully', async () => {
      const updateClientDto: UpdateClientDto = {
        name: 'Jane Doe',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockClient);
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue({ ...mockClient, ...updateClientDto });

      const result = await service.update('1', updateClientDto);

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(repository.save).toHaveBeenCalled();
      expect(result.name).toBe('Jane Doe');
    });
  });

  describe('addTags', () => {
    it('should add tags to a client', async () => {
      const tagClientDto: TagClientDto = {
        tags: ['VIP', 'Wholesale'],
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockClient);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue({ ...mockClient, tags: ['VIP', 'Wholesale'] });

      const result = await service.addTags('1', tagClientDto);

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(repository.save).toHaveBeenCalled();
      expect(result.tags).toEqual(['VIP', 'Wholesale']);
    });
  });
});
