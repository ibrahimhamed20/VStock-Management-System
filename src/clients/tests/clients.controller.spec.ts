import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from '../clients.controller';
import { ClientsService } from '../clients.service';
import { CreateClientDto } from '../dtos/create-client.dto';
import { UpdateClientDto } from '../dtos/update-client.dto';
import { TagClientDto } from '../dtos/tag-client.dto';

describe('ClientsController', () => {
  let controller: ClientsController;
  let service: ClientsService;

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

  const mockClientsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addTags: jest.fn(),
    removeTags: jest.fn(),
    addTransaction: jest.fn(),
    getTransactionHistory: jest.fn(),
    findByTag: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: ClientsService,
          useValue: mockClientsService,
        },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
    service = module.get<ClientsService>(ClientsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a client', async () => {
      const createClientDto: CreateClientDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockClient);

      const result = await controller.create(createClientDto);

      expect(service.create).toHaveBeenCalledWith(createClientDto);
      expect(result).toEqual(mockClient);
    });
  });

  describe('findAll', () => {
    it('should return an array of clients', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockClient]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockClient]);
    });
  });

  describe('findOne', () => {
    it('should return a client by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockClient);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockClient);
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const updateClientDto: UpdateClientDto = {
        name: 'Jane Doe',
      };

      jest
        .spyOn(service, 'update')
        .mockResolvedValue({ ...mockClient, ...updateClientDto });

      const result = await controller.update('1', updateClientDto);

      expect(service.update).toHaveBeenCalledWith('1', updateClientDto);
      expect(result.name).toBe('Jane Doe');
    });
  });

  describe('remove', () => {
    it('should remove a client', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('addTags', () => {
    it('should add tags to a client', async () => {
      const tagClientDto: TagClientDto = {
        tags: ['VIP', 'Wholesale'],
      };

      jest
        .spyOn(service, 'addTags')
        .mockResolvedValue({ ...mockClient, tags: ['VIP', 'Wholesale'] });

      const result = await controller.addTags('1', tagClientDto);

      expect(service.addTags).toHaveBeenCalledWith('1', tagClientDto);
      expect(result.tags).toEqual(['VIP', 'Wholesale']);
    });
  });
});
