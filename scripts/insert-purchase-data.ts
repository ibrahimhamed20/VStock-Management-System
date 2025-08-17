import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Logger } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

// Import entities
import { Purchase } from '../src/purchasing/entities/purchase.entity';
import { PurchaseItem } from '../src/purchasing/entities/purchase-item.entity';
import { Supplier } from '../src/purchasing/entities/supplier.entity';
import { Product } from '../src/inventory/entities/product.entity';
import { User } from '../src/users/entities/user.entity';

// Import enums
import { PurchaseStatus, PaymentStatus } from '../src/purchasing/interfaces/purchase.interface';

async function bootstrap() {
  console.log('🛒 Starting purchase data insertion...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('PurchaseDataInserter');
  
  try {
    // Get repositories
    const purchaseRepository = app.get(getRepositoryToken(Purchase));
    const purchaseItemRepository = app.get(getRepositoryToken(PurchaseItem));
    const supplierRepository = app.get(getRepositoryToken(Supplier));
    const productRepository = app.get(getRepositoryToken(Product));
    const userRepository = app.get(getRepositoryToken(User));

    // Helper function to convert Excel date to JavaScript Date
    const excelDateToDate = (excelDate: number): Date => {
      // Excel dates are days since 1900-01-01 (with some quirks)
      // Add 2 days to account for Excel's leap year bug
      const date = new Date(1900, 0, 1);
      date.setDate(date.getDate() + excelDate + 2);
      return date;
    };

    // Get required references
    const supplier = await supplierRepository.findOne({
      where: { code: 'supplier-tunkaya' }
    });

    const adminUser = await userRepository.findOne({
      where: { username: 'admin' }
    });

    if (!supplier) {
      throw new Error('Supplier "supplier-tunkaya" not found. Please run the basic seeding first.');
    }

    if (!adminUser) {
      throw new Error('Admin user not found. Please run the basic seeding first.');
    }

    // =====================================================
    // 1. PURCHASE ORDERS
    // =====================================================

    logger.log('Creating purchase orders...');

    const purchaseData = [
      {
        code: 'purchase-2025-04-09-001',
        purchaseNumber: 'PO-2025-04-09-001',
        subtotal: 70500.00,
        taxRate: 0.00,
        taxAmount: 0.00,
        shippingCost: 0.00,
        totalAmount: 70500.00,
        paidAmount: 70500.00,
        remainingAmount: 0.00,
        purchaseStatus: PurchaseStatus.RECEIVED,
        paymentStatus: PaymentStatus.PAID,
        orderDate: excelDateToDate(45409), // April 9, 2025
        expectedDeliveryDate: excelDateToDate(45409),
        actualDeliveryDate: excelDateToDate(45409),
        notes: 'Initial inventory purchase - Class A and B products'
      },
      {
        code: 'purchase-2025-05-10-001',
        purchaseNumber: 'PO-2025-05-10-001',
        subtotal: 44200.00,
        taxRate: 0.00,
        taxAmount: 0.00,
        shippingCost: 0.00,
        totalAmount: 44200.00,
        paidAmount: 44200.00,
        remainingAmount: 0.00,
        purchaseStatus: PurchaseStatus.RECEIVED,
        paymentStatus: PaymentStatus.PAID,
        orderDate: excelDateToDate(45440), // May 10, 2025
        expectedDeliveryDate: excelDateToDate(45440),
        actualDeliveryDate: excelDateToDate(45440),
        notes: 'Inventory purchase - Class B-300 and C products'
      },
      {
        code: 'purchase-2025-06-02-001',
        purchaseNumber: 'PO-2025-06-02-001',
        subtotal: 80900.00,
        taxRate: 0.00,
        taxAmount: 0.00,
        shippingCost: 0.00,
        totalAmount: 80900.00,
        paidAmount: 80900.00,
        remainingAmount: 0.00,
        purchaseStatus: PurchaseStatus.RECEIVED,
        paymentStatus: PaymentStatus.PAID,
        orderDate: excelDateToDate(45463), // June 2, 2025
        expectedDeliveryDate: excelDateToDate(45463),
        actualDeliveryDate: excelDateToDate(45463),
        notes: 'Inventory purchase - Class B-hanen products'
      },
      {
        code: 'purchase-2025-06-19-001',
        purchaseNumber: 'PO-2025-06-19-001',
        subtotal: 41133.00,
        taxRate: 0.00,
        taxAmount: 0.00,
        shippingCost: 0.00,
        totalAmount: 41133.00,
        paidAmount: 41133.00,
        remainingAmount: 0.00,
        purchaseStatus: PurchaseStatus.RECEIVED,
        paymentStatus: PaymentStatus.PAID,
        orderDate: excelDateToDate(45480), // June 19, 2025
        expectedDeliveryDate: excelDateToDate(45480),
        actualDeliveryDate: excelDateToDate(45480),
        notes: 'Inventory purchase - Class B-321 products'
      }
    ];

    const createdPurchases: Purchase[] = [];

    for (const purchaseInfo of purchaseData) {
      // Check if purchase already exists
      const existingPurchase = await purchaseRepository.findOne({
        where: { purchaseNumber: purchaseInfo.purchaseNumber }
      });

      if (existingPurchase) {
        logger.log(`Purchase ${purchaseInfo.purchaseNumber} already exists, skipping...`);
        createdPurchases.push(existingPurchase);
        continue;
      }

      // Create purchase
      const purchase = purchaseRepository.create({
        ...purchaseInfo,
        supplierId: supplier.id,
        createdBy: adminUser.id,
        createdByName: 'Admin User'
      });

      const savedPurchase = await purchaseRepository.save(purchase);
      createdPurchases.push(savedPurchase);
      logger.log(`Created purchase: ${purchaseInfo.purchaseNumber}`);
    }

    // =====================================================
    // 2. PURCHASE ITEMS
    // =====================================================

    logger.log('Creating purchase items...');

    const purchaseItemsData = [
      // Purchase Order 1: Class A and B
      {
        purchaseNumber: 'PO-2025-04-09-001',
        items: [
          {
            productSku: 'INV-CLASS-A',
            productName: 'inventory class A',
            quantity: 100,
            unitCost: 395.00,
            totalCost: 39500.00,
            receivedQuantity: 100,
            notes: 'Premium inventory class A products'
          },
          {
            productSku: 'INV-CLASS-B',
            productName: 'inventory class B',
            quantity: 100,
            unitCost: 310.00,
            totalCost: 31000.00,
            receivedQuantity: 100,
            notes: 'Standard inventory class B products'
          }
        ]
      },
      // Purchase Order 2: Class B-300 and C
      {
        purchaseNumber: 'PO-2025-05-10-001',
        items: [
          {
            productSku: 'INV-CLASS-B-300',
            productName: 'inventory class B-300',
            quantity: 42,
            unitCost: 300.00,
            totalCost: 12600.00,
            receivedQuantity: 42,
            notes: 'Special inventory class B-300 products'
          },
          {
            productSku: 'INV-CLASS-C',
            productName: 'Inventory class C',
            quantity: 158,
            unitCost: 200.00,
            totalCost: 31600.00,
            receivedQuantity: 158,
            notes: 'Economy inventory class C products'
          }
        ]
      },
      // Purchase Order 3: Class B-hanen
      {
        purchaseNumber: 'PO-2025-06-02-001',
        items: [
          {
            productSku: 'INV-CLASS-B-HANEN',
            productName: 'inventory class B-hanen',
            quantity: 257,
            unitCost: 315.00,
            totalCost: 80900.00,
            receivedQuantity: 257,
            notes: 'Special inventory class B-hanen products'
          }
        ]
      },
      // Purchase Order 4: Class B-321
      {
        purchaseNumber: 'PO-2025-06-19-001',
        items: [
          {
            productSku: 'INV-CLASS-B-321',
            productName: 'inventory class B-321',
            quantity: 128,
            unitCost: 321.35,
            totalCost: 41133.00,
            receivedQuantity: 128,
            notes: 'Special inventory class B-321 products'
          }
        ]
      }
    ];

    for (const purchaseItemsInfo of purchaseItemsData) {
      const purchase = createdPurchases.find(p => p.purchaseNumber === purchaseItemsInfo.purchaseNumber);
      
      if (!purchase) {
        logger.warn(`Purchase ${purchaseItemsInfo.purchaseNumber} not found, skipping items...`);
        continue;
      }

      for (const itemInfo of purchaseItemsInfo.items) {
        // Get product
        const product = await productRepository.findOne({
          where: { sku: itemInfo.productSku }
        });

        if (!product) {
          logger.warn(`Product ${itemInfo.productSku} not found, skipping item...`);
          continue;
        }

        // Check if purchase item already exists
        const existingItem = await purchaseItemRepository.findOne({
          where: {
            purchaseId: purchase.id,
            productId: product.id
          }
        });

        if (existingItem) {
          logger.log(`Purchase item for ${itemInfo.productSku} in ${purchaseItemsInfo.purchaseNumber} already exists, skipping...`);
          continue;
        }

        // Create purchase item
        const purchaseItem = purchaseItemRepository.create({
          purchaseId: purchase.id,
          productId: product.id,
          productName: itemInfo.productName,
          productSku: itemInfo.productSku,
          quantity: itemInfo.quantity,
          unitCost: itemInfo.unitCost,
          totalCost: itemInfo.totalCost,
          receivedQuantity: itemInfo.receivedQuantity,
          notes: itemInfo.notes
        });

        await purchaseItemRepository.save(purchaseItem);
        logger.log(`Created purchase item: ${itemInfo.productSku} (${itemInfo.quantity} units)`);
      }
    }

    // =====================================================
    // 3. UPDATE PRODUCT STOCK LEVELS
    // =====================================================

    logger.log('Updating product stock levels...');

    const products = await productRepository.find({
      where: {
        sku: [
          'INV-CLASS-A', 'INV-CLASS-B', 'INV-CLASS-B-300', 'INV-CLASS-C',
          'INV-CLASS-B-HANEN', 'INV-CLASS-B-321', 'INV-CLASS-A-401'
        ]
      }
    });

    for (const product of products) {
      // Calculate total received quantity for this product
      const totalReceived = await purchaseItemRepository
        .createQueryBuilder('pi')
        .innerJoin('pi.purchase', 'p')
        .where('pi.productId = :productId', { productId: product.id })
        .andWhere('p.purchaseStatus = :status', { status: PurchaseStatus.RECEIVED })
        .select('SUM(pi.receivedQuantity)', 'total')
        .getRawOne();

      const receivedQty = parseInt(totalReceived?.total || '0');
      
      if (receivedQty > 0) {
        product.stock += receivedQty;
        await productRepository.save(product);
        logger.log(`Updated stock for ${product.sku}: +${receivedQty} units (new total: ${product.stock})`);
      }
    }

    // =====================================================
    // 4. VERIFICATION
    // =====================================================

    logger.log('Verifying inserted data...');

    const purchaseCount = await purchaseRepository.count({
      where: { purchaseNumber: { like: 'PO-2025-%' } }
    });

    const purchaseItemCount = await purchaseItemRepository
      .createQueryBuilder('pi')
      .innerJoin('pi.purchase', 'p')
      .where('p.purchaseNumber LIKE :pattern', { pattern: 'PO-2025-%' })
      .getCount();

    const totalPurchaseValue = await purchaseRepository
      .createQueryBuilder('p')
      .where('p.purchaseNumber LIKE :pattern', { pattern: 'PO-2025-%' })
      .select('SUM(p.totalAmount)', 'total')
      .getRawOne();

    console.log('\n=== PURCHASE DATA INSERTION SUMMARY ===');
    console.table([
      { Metric: 'Purchases Created', Value: purchaseCount },
      { Metric: 'Purchase Items Created', Value: purchaseItemCount },
      { Metric: 'Total Purchase Value (EGP)', Value: parseFloat(totalPurchaseValue?.total || '0').toFixed(2) }
    ]);

    console.log('\n✅ Purchase data insertion completed successfully!');
    console.log('\n📋 Purchase Summary:');
    console.log('1. PO-2025-04-09-001: Class A (100) + Class B (100) = 70,500 EGP');
    console.log('2. PO-2025-05-10-001: Class B-300 (42) + Class C (158) = 44,200 EGP');
    console.log('3. PO-2025-06-02-001: Class B-hanen (257) = 80,900 EGP');
    console.log('4. PO-2025-06-19-001: Class B-321 (128) = 41,133 EGP');
    console.log(`Total: ${parseFloat(totalPurchaseValue?.total || '0').toFixed(2)} EGP`);

  } catch (error) {
    console.error('❌ Error during purchase data insertion:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap(); 