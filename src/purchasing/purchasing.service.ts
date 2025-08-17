import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual } from 'typeorm';
import { Purchase } from './entities/purchase.entity';
import { PurchaseItem } from './entities/purchase-item.entity';
import { Supplier } from './entities/supplier.entity';
import { CreatePurchaseDto, PurchaseItemDto } from './dtos/create-purchase.dto';
import { CreateSupplierDto } from './dtos/create-supplier.dto';
import {
  IPurchase,
  ICreatePurchase,
  IUpdatePurchase,
  ISupplier,
  ICreateSupplier,
  IUpdateSupplier,
  IPurchaseReport,
  PurchaseStatus,
  PaymentStatus,
} from './interfaces/purchase.interface';

@Injectable()
export class PurchasingService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
    @InjectRepository(PurchaseItem)
    private readonly purchaseItemRepository: Repository<PurchaseItem>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  // Purchase Management
  async createPurchase(
    createPurchaseDto: CreatePurchaseDto,
    userId: string,
    userName: string,
  ): Promise<IPurchase> {
    const {
      supplierId,
      items,
      taxRate = 0,
      shippingCost = 0,
      expectedDeliveryDate,
      notes,
    } = createPurchaseDto;

    // Validate supplier exists
    const supplier = await this.supplierRepository.findOne({
      where: { id: supplierId },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Validate items
    if (!items || items.length === 0) {
      throw new BadRequestException('Purchase must have at least one item');
    }

    // Generate purchase number
    const purchaseNumber = await this.generatePurchaseNumber();

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
      return sum + item.quantity * item.unitCost;
    }, 0);

    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount + shippingCost;

    // Create purchase
    const purchase = this.purchaseRepository.create({
      purchaseNumber,
      supplierId,
      subtotal,
      taxRate,
      taxAmount,
      shippingCost,
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
      purchaseStatus: PurchaseStatus.DRAFT,
      paymentStatus: PaymentStatus.PENDING,
      orderDate: new Date(),
      expectedDeliveryDate: expectedDeliveryDate
        ? new Date(expectedDeliveryDate)
        : this.calculateDefaultDeliveryDate(),
      notes,
      createdBy: userId,
      createdByName: userName,
    });

    const savedPurchase = await this.purchaseRepository.save(purchase);

    // Create purchase items
    const purchaseItems = items.map((item) =>
      this.purchaseItemRepository.create({
        purchaseId: savedPurchase.id,
        productId: item.productId,
        productName: item.productName || 'Unknown Product',
        productSku: item.productSku || 'N/A',
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.quantity * item.unitCost,
        receivedQuantity: 0,
        notes: item.notes,
      }),
    );

    await this.purchaseItemRepository.save(purchaseItems);

    return this.mapPurchaseToInterface(savedPurchase, purchaseItems, supplier);
  }

  async findAllPurchases(): Promise<IPurchase[]> {
    const purchases = await this.purchaseRepository.find({
      relations: ['items', 'supplier'],
      order: { orderDate: 'DESC' },
    });

    return purchases.map((purchase) =>
      this.mapPurchaseToInterface(purchase, purchase.items, purchase.supplier),
    );
  }

  async findPurchaseById(id: string): Promise<IPurchase> {
    const purchase = await this.purchaseRepository.findOne({
      where: { id },
      relations: ['items', 'supplier'],
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    return this.mapPurchaseToInterface(
      purchase,
      purchase.items,
      purchase.supplier,
    );
  }

  async findPurchaseByNumber(purchaseNumber: string): Promise<IPurchase> {
    const purchase = await this.purchaseRepository.findOne({
      where: { purchaseNumber },
      relations: ['items', 'supplier'],
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    return this.mapPurchaseToInterface(
      purchase,
      purchase.items,
      purchase.supplier,
    );
  }

  async findPurchasesBySupplier(supplierId: string): Promise<IPurchase[]> {
    const purchases = await this.purchaseRepository.find({
      where: { supplierId },
      relations: ['items', 'supplier'],
      order: { orderDate: 'DESC' },
    });

    return purchases.map((purchase) =>
      this.mapPurchaseToInterface(purchase, purchase.items, purchase.supplier),
    );
  }

  async findPurchasesByStatus(status: PurchaseStatus): Promise<IPurchase[]> {
    const purchases = await this.purchaseRepository.find({
      where: { purchaseStatus: status },
      relations: ['items', 'supplier'],
      order: { orderDate: 'DESC' },
    });

    return purchases.map((purchase) =>
      this.mapPurchaseToInterface(purchase, purchase.items, purchase.supplier),
    );
  }

  async updatePurchase(
    id: string,
    updatePurchaseDto: IUpdatePurchase,
  ): Promise<IPurchase> {
    const purchase = await this.purchaseRepository.findOne({
      where: { id },
      relations: ['items', 'supplier'],
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    // Check if purchase can be updated
    if (purchase.purchaseStatus === PurchaseStatus.RECEIVED) {
      throw new BadRequestException('Cannot update a received purchase');
    }

    // Update purchase fields
    if (updatePurchaseDto.taxRate !== undefined) {
      purchase.taxRate = updatePurchaseDto.taxRate;
    }
    if (updatePurchaseDto.shippingCost !== undefined) {
      purchase.shippingCost = updatePurchaseDto.shippingCost;
    }
    if (updatePurchaseDto.expectedDeliveryDate !== undefined) {
      purchase.expectedDeliveryDate = new Date(
        updatePurchaseDto.expectedDeliveryDate,
      );
    }
    if (updatePurchaseDto.actualDeliveryDate !== undefined) {
      purchase.actualDeliveryDate = new Date(
        updatePurchaseDto.actualDeliveryDate,
      );
    }
    if (updatePurchaseDto.notes !== undefined) {
      purchase.notes = updatePurchaseDto.notes;
    }
    if (updatePurchaseDto.purchaseStatus !== undefined) {
      purchase.purchaseStatus = updatePurchaseDto.purchaseStatus;
    }
    if (updatePurchaseDto.paymentStatus !== undefined) {
      purchase.paymentStatus = updatePurchaseDto.paymentStatus;
    }

    // Update items if provided
    if (updatePurchaseDto.items) {
      // Remove existing items
      await this.purchaseItemRepository.delete({ purchaseId: id });

      // Create new items
      const purchaseItems = updatePurchaseDto.items.map((item) =>
        this.purchaseItemRepository.create({
          purchaseId: id,
          productId: item.productId,
          productName: item.productName || 'Unknown Product',
          productSku: item.productSku || 'N/A',
          quantity: item.quantity,
          unitCost: item.unitCost,
          totalCost: item.quantity * item.unitCost,
          receivedQuantity: 0,
          notes: item.notes,
        }),
      );

      await this.purchaseItemRepository.save(purchaseItems);
      purchase.items = purchaseItems;
    }

    // Recalculate totals
    const subtotal = purchase.items.reduce(
      (sum, item) => sum + item.totalCost,
      0,
    );
    const taxAmount = (subtotal * purchase.taxRate) / 100;
    const totalAmount = subtotal + taxAmount + purchase.shippingCost;

    purchase.subtotal = subtotal;
    purchase.taxAmount = taxAmount;
    purchase.totalAmount = totalAmount;
    purchase.remainingAmount = totalAmount - purchase.paidAmount;

    const updatedPurchase = await this.purchaseRepository.save(purchase);

    return this.mapPurchaseToInterface(
      updatedPurchase,
      updatedPurchase.items,
      updatedPurchase.supplier,
    );
  }

  async deletePurchase(id: string): Promise<void> {
    const purchase = await this.purchaseRepository.findOne({ where: { id } });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    if (purchase.purchaseStatus === PurchaseStatus.RECEIVED) {
      throw new BadRequestException('Cannot delete a received purchase');
    }

    await this.purchaseRepository.remove(purchase);
  }

  async receivePurchase(
    id: string,
    receivedItems: Array<{ itemId: string; receivedQuantity: number }>,
  ): Promise<IPurchase> {
    const purchase = await this.purchaseRepository.findOne({
      where: { id },
      relations: ['items', 'supplier'],
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    if (purchase.purchaseStatus !== PurchaseStatus.ORDERED) {
      throw new BadRequestException(
        'Purchase must be in ORDERED status to receive',
      );
    }

    // Update received quantities
    for (const receivedItem of receivedItems) {
      const item = purchase.items.find((i) => i.id === receivedItem.itemId);
      if (item) {
        if (receivedItem.receivedQuantity > item.quantity) {
          throw new BadRequestException(
            `Received quantity cannot exceed ordered quantity for item ${item.productName}`,
          );
        }
        item.receivedQuantity = receivedItem.receivedQuantity;
      }
    }

    // Check if all items are fully received
    const allReceived = purchase.items.every(
      (item) => item.receivedQuantity === item.quantity,
    );

    if (allReceived) {
      purchase.purchaseStatus = PurchaseStatus.RECEIVED;
      purchase.actualDeliveryDate = new Date();
    }

    await this.purchaseItemRepository.save(purchase.items);
    const updatedPurchase = await this.purchaseRepository.save(purchase);

    return this.mapPurchaseToInterface(
      updatedPurchase,
      updatedPurchase.items,
      updatedPurchase.supplier,
    );
  }

  // Supplier Management
  async createSupplier(
    createSupplierDto: CreateSupplierDto,
  ): Promise<ISupplier> {
    const {
      name,
      email,
      phone,
      address,
      contactPerson,
      taxId,
      paymentTerms = 30,
    } = createSupplierDto;

    // Check if supplier with same name or email exists
    const existingSupplier = await this.supplierRepository.findOne({
      where: [{ name }, { email }],
    });

    if (existingSupplier) {
      throw new ConflictException(
        'Supplier with this name or email already exists',
      );
    }

    const supplier = this.supplierRepository.create({
      name,
      email,
      phone,
      address,
      contactPerson,
      taxId,
      paymentTerms,
      isActive: true,
    });

    const savedSupplier = await this.supplierRepository.save(supplier);
    return this.mapSupplierToInterface(savedSupplier);
  }

  async findAllSuppliers(): Promise<ISupplier[]> {
    const suppliers = await this.supplierRepository.find({
      order: { name: 'ASC' },
    });

    return suppliers.map((supplier) => this.mapSupplierToInterface(supplier));
  }

  async findSupplierById(id: string): Promise<ISupplier> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return this.mapSupplierToInterface(supplier);
  }

  async updateSupplier(
    id: string,
    updateSupplierDto: IUpdateSupplier,
  ): Promise<ISupplier> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Check for name/email conflicts if updating
    if (updateSupplierDto.name || updateSupplierDto.email) {
      const existingSupplier = await this.supplierRepository.findOne({
        where: [
          { name: updateSupplierDto.name || supplier.name },
          { email: updateSupplierDto.email || supplier.email },
        ],
      });

      if (existingSupplier && existingSupplier.id !== id) {
        throw new ConflictException(
          'Supplier with this name or email already exists',
        );
      }
    }

    Object.assign(supplier, updateSupplierDto);
    const updatedSupplier = await this.supplierRepository.save(supplier);

    return this.mapSupplierToInterface(updatedSupplier);
  }

  async deleteSupplier(id: string): Promise<void> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Check if supplier has any purchases
    const purchaseCount = await this.purchaseRepository.count({
      where: { supplierId: id },
    });

    if (purchaseCount > 0) {
      throw new BadRequestException(
        'Cannot delete supplier with existing purchases',
      );
    }

    await this.supplierRepository.remove(supplier);
  }

  // Reports
  async getPurchaseReport(
    startDate?: Date,
    endDate?: Date,
  ): Promise<IPurchaseReport> {
    const queryBuilder = this.purchaseRepository.createQueryBuilder('purchase');

    if (startDate && endDate) {
      queryBuilder.where('purchase.orderDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const purchases = await queryBuilder
      .leftJoinAndSelect('purchase.items', 'items')
      .leftJoinAndSelect('purchase.supplier', 'supplier')
      .getMany();

    const totalPurchases = purchases.length;
    const totalAmount = purchases.reduce(
      (sum, purchase) => sum + Number(purchase.totalAmount),
      0,
    );
    const pendingPurchases = purchases.filter(
      (p) => p.purchaseStatus === PurchaseStatus.PENDING,
    ).length;
    const receivedPurchases = purchases.filter(
      (p) => p.purchaseStatus === PurchaseStatus.RECEIVED,
    ).length;

    // Calculate top suppliers
    const supplierStats = new Map<
      string,
      { name: string; purchases: number; totalAmount: number }
    >();

    purchases.forEach((purchase) => {
      const key = purchase.supplierId;
      const existing = supplierStats.get(key) || {
        name: purchase.supplier.name,
        purchases: 0,
        totalAmount: 0,
      };
      existing.purchases += 1;
      existing.totalAmount += Number(purchase.totalAmount);
      supplierStats.set(key, existing);
    });

    const topSuppliers = Array.from(supplierStats.entries())
      .map(([supplierId, stats]) => ({
        supplierId,
        supplierName: stats.name,
        purchases: stats.purchases,
        totalAmount: stats.totalAmount,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);

    // Calculate purchases by period
    const purchasesByPeriod = this.calculatePurchasesByPeriod(purchases);

    return {
      totalPurchases,
      totalAmount,
      pendingPurchases,
      receivedPurchases,
      averagePurchaseValue:
        totalPurchases > 0 ? totalAmount / totalPurchases : 0,
      topSuppliers,
      purchasesByPeriod,
    };
  }

  async getOverduePurchases(): Promise<IPurchase[]> {
    const overduePurchases = await this.purchaseRepository.find({
      where: {
        purchaseStatus: PurchaseStatus.ORDERED,
        expectedDeliveryDate: LessThanOrEqual(new Date()),
      },
      relations: ['items', 'supplier'],
      order: { expectedDeliveryDate: 'ASC' },
    });

    return overduePurchases.map((purchase) =>
      this.mapPurchaseToInterface(purchase, purchase.items, purchase.supplier),
    );
  }

  // Utility methods
  private async generatePurchaseNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PO-${year}`;

    const lastPurchase = await this.purchaseRepository
      .createQueryBuilder('purchase')
      .where('purchase.purchaseNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('purchase.purchaseNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastPurchase) {
      const lastSequence = parseInt(lastPurchase.purchaseNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }

  private calculateDefaultDeliveryDate(): Date {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 14); // 14 days from order date
    return deliveryDate;
  }

  private calculatePurchasesByPeriod(purchases: Purchase[]): Array<{
    period: string;
    purchases: number;
    amount: number;
  }> {
    const periodStats = new Map<
      string,
      { purchases: number; amount: number }
    >();

    purchases.forEach((purchase) => {
      const period = `${purchase.orderDate.getFullYear()}-${(
        purchase.orderDate.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}`;

      const existing = periodStats.get(period) || { purchases: 0, amount: 0 };
      existing.purchases += 1;
      existing.amount += Number(purchase.totalAmount);
      periodStats.set(period, existing);
    });

    return Array.from(periodStats.entries())
      .map(([period, stats]) => ({
        period,
        purchases: stats.purchases,
        amount: stats.amount,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  private mapPurchaseToInterface(
    purchase: Purchase,
    items: PurchaseItem[],
    supplier: Supplier,
  ): IPurchase {
    return {
      id: purchase.id,
      purchaseNumber: purchase.purchaseNumber,
      supplierId: purchase.supplierId,
      supplierName: supplier.name,
      supplierEmail: supplier.email,
      supplierPhone: supplier.phone,
      supplierAddress: supplier.address,
      supplierPaymentTerms: supplier.paymentTerms.toString(),
      items: items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unitCost: Number(item.unitCost),
        totalCost: Number(item.totalCost),
        receivedQuantity: item.receivedQuantity,
        notes: item.notes,
      })),
      subtotal: Number(purchase.subtotal),
      taxAmount: Number(purchase.taxAmount),
      shippingCost: Number(purchase.shippingCost),
      totalAmount: Number(purchase.totalAmount),
      paidAmount: Number(purchase.paidAmount),
      remainingAmount: Number(purchase.remainingAmount),
      purchaseStatus: purchase.purchaseStatus,
      paymentStatus: purchase.paymentStatus,
      orderDate: purchase.orderDate,
      expectedDeliveryDate: purchase.expectedDeliveryDate,
      actualDeliveryDate: purchase.actualDeliveryDate,
      notes: purchase.notes,
      createdBy: purchase.createdBy,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
    };
  }

  private mapSupplierToInterface(supplier: Supplier): ISupplier {
    return {
      id: supplier.id,
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      contactPerson: supplier.contactPerson,
      taxId: supplier.taxId,
      paymentTerms: supplier.paymentTerms,
      isActive: supplier.isActive,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
    };
  }
}
