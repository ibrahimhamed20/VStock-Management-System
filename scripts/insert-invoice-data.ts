import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Logger } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

// Import entities
import { Invoice } from '../src/sales/entities/invoice.entity';
import { InvoiceItem } from '../src/sales/entities/invoice-item.entity';
import { Payment } from '../src/sales/entities/payment.entity';
import { Client } from '../src/clients/entities/client.entity';
import { Product } from '../src/inventory/entities/product.entity';
import { User } from '../src/users/entities/user.entity';

// Import enums
import { PaymentStatus, PaymentMethod } from '../src/sales/interfaces/invoice.interface';

async function bootstrap() {
  console.log('📄 Starting invoice data insertion...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('InvoiceDataInserter');
  
  try {
    // Get repositories
    const invoiceRepository = app.get(getRepositoryToken(Invoice));
    const invoiceItemRepository = app.get(getRepositoryToken(InvoiceItem));
    const paymentRepository = app.get(getRepositoryToken(Payment));
    const clientRepository = app.get(getRepositoryToken(Client));
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
    const adminUser = await userRepository.findOne({
      where: { username: 'admin' }
    });

    if (!adminUser) {
      throw new Error('Admin user not found. Please run the basic seeding first.');
    }

    // =====================================================
    // 1. INVOICES
    // =====================================================

    logger.log('Creating invoices...');

    const invoiceData = [
      {
        code: 'inv-891',
        invoiceNumber: '891',
        clientCode: 'client-hart-attack',
        subtotal: 1040.00,
        taxRate: 0.00,
        taxAmount: 0.00,
        discountAmount: 0.00,
        totalAmount: 1040.00,
        paidAmount: 1040.00,
        remainingAmount: 0.00,
        paymentStatus: PaymentStatus.PAID,
        issueDate: excelDateToDate(45415), // April 15, 2025
        dueDate: excelDateToDate(45415),
        notes: 'هارت اتاك - Class A'
      },
      {
        code: 'inv-892',
        invoiceNumber: '892',
        clientCode: 'client-city-crepe',
        subtotal: 520.00,
        taxRate: 0.00,
        taxAmount: 0.00,
        discountAmount: 0.00,
        totalAmount: 520.00,
        paidAmount: 520.00,
        remainingAmount: 0.00,
        paymentStatus: PaymentStatus.PAID,
        issueDate: excelDateToDate(45415), // April 15, 2025
        dueDate: excelDateToDate(45415),
        notes: 'سيتي كريب - Class A'
      },
      {
        code: 'inv-893',
        invoiceNumber: '893',
        clientCode: 'client-minzu-restaurant',
        subtotal: 450.00,
        taxRate: 0.00,
        taxAmount: 0.00,
        discountAmount: 0.00,
        totalAmount: 450.00,
        paidAmount: 450.00,
        remainingAmount: 0.00,
        paymentStatus: PaymentStatus.PAID,
        issueDate: excelDateToDate(45415), // April 15, 2025
        dueDate: excelDateToDate(45415),
        notes: 'مطعم مينزو - Class B - معجبتوش'
      },
      {
        code: 'inv-894',
        invoiceNumber: '894',
        clientCode: 'client-samra-restaurant',
        subtotal: 1040.00,
        taxRate: 0.00,
        taxAmount: 0.00,
        discountAmount: 0.00,
        totalAmount: 1040.00,
        paidAmount: 1040.00,
        remainingAmount: 0.00,
        paymentStatus: PaymentStatus.PAID,
        issueDate: excelDateToDate(45416), // April 16, 2025
        dueDate: excelDateToDate(45416),
        notes: 'مطعم سمره - Class A'
      },
      {
        code: 'inv-895',
        invoiceNumber: '895',
        clientCode: 'client-dodge-restaurant',
        subtotal: 520.00,
        taxRate: 0.00,
        taxAmount: 0.00,
        discountAmount: 0.00,
        totalAmount: 520.00,
        paidAmount: 520.00,
        remainingAmount: 0.00,
        paymentStatus: PaymentStatus.PAID,
        issueDate: excelDateToDate(45416), // April 16, 2025
        dueDate: excelDateToDate(45416),
        notes: 'مطعم دودج - Class A'
      },
      {
        code: 'inv-896',
        invoiceNumber: '896',
        clientCode: 'client-mini-pablo',
        subtotal: 520.00,
        taxRate: 0.00,
        taxAmount: 0.00,
        discountAmount: 0.00,
        totalAmount: 520.00,
        paidAmount: 520.00,
        remainingAmount: 0.00,
        paymentStatus: PaymentStatus.PAID,
        issueDate: excelDateToDate(45416), // April 16, 2025
        dueDate: excelDateToDate(45416),
        notes: 'مطعم ميني بابلو - Class A'
      },
      {
        code: 'inv-897',
        invoiceNumber: '897',
        clientCode: 'client-hart-attack',
        subtotal: 1350.00,
        taxRate: 0.00,
        taxAmount: 0.00,
        discountAmount: 0.00,
        totalAmount: 1350.00,
        paidAmount: 1350.00,
        remainingAmount: 0.00,
        paymentStatus: PaymentStatus.PAID,
        issueDate: excelDateToDate(45417), // April 17, 2025
        dueDate: excelDateToDate(45417),
        notes: 'هارت اتاك - Class B'
      },
      {
        code: 'inv-898',
        invoiceNumber: '898',
        clientCode: 'client-piatto',
        subtotal: 900.00,
        taxRate: 0.00,
        taxAmount: 0.00,
        discountAmount: 0.00,
        totalAmount: 900.00,
        paidAmount: 900.00,
        remainingAmount: 0.00,
        paymentStatus: PaymentStatus.PAID,
        issueDate: excelDateToDate(45418), // April 18, 2025
        dueDate: excelDateToDate(45418),
        notes: 'Piatto - Class B'
      },
      {
        code: 'inv-899',
        invoiceNumber: '899',
        clientCode: 'client-shawarma-station',
        subtotal: 970.00,
        taxRate: 0.00,
        taxAmount: 0.00,
        discountAmount: 0.00,
        totalAmount: 970.00,
        paidAmount: 970.00,
        remainingAmount: 0.00,
        paymentStatus: PaymentStatus.PAID,
        issueDate: excelDateToDate(45418), // April 18, 2025
        dueDate: excelDateToDate(45418),
        notes: 'شاورما ستيشن - Class A & B'
      },
      {
        code: 'inv-900',
        invoiceNumber: '900',
        clientCode: 'client-town-burger',
        subtotal: 520.00,
        taxRate: 0.00,
        taxAmount: 0.00,
        discountAmount: 0.00,
        totalAmount: 520.00,
        paidAmount: 520.00,
        remainingAmount: 0.00,
        paymentStatus: PaymentStatus.PAID,
        issueDate: excelDateToDate(45418), // April 18, 2025
        dueDate: excelDateToDate(45418),
        notes: 'تاون برجر - Class A'
      },
      {
        code: 'inv-901',
        invoiceNumber: '901',
        clientCode: 'client-pizza-corners',
        subtotal: 520.00,
        taxRate: 0.00,
        taxAmount: 0.00,
        discountAmount: 0.00,
        totalAmount: 520.00,
        paidAmount: 520.00,
        remainingAmount: 0.00,
        paymentStatus: PaymentStatus.PAID,
        issueDate: excelDateToDate(45418), // April 18, 2025
        dueDate: excelDateToDate(45418),
        notes: 'بيتزا كورنرز - Class A'
      },
      {
        code: 'inv-902',
        invoiceNumber: '902',
        clientCode: 'client-shawarma-station',
        subtotal: 1800.00,
        taxRate: 0.00,
        taxAmount: 0.00,
        discountAmount: 0.00,
        totalAmount: 1800.00,
        paidAmount: 1800.00,
        remainingAmount: 0.00,
        paymentStatus: PaymentStatus.PAID,
        issueDate: excelDateToDate(45419), // April 19, 2025
        dueDate: excelDateToDate(45419),
        notes: 'شاورما ستيشن - Class B'
      },
      {
        code: 'inv-903',
        invoiceNumber: '903',
        clientCode: 'client-shawarma-station',
        subtotal: 1800.00,
        taxRate: 0.00,
        taxAmount: 0.00,
        discountAmount: 0.00,
        totalAmount: 1800.00,
        paidAmount: 1800.00,
        remainingAmount: 0.00,
        paymentStatus: PaymentStatus.PAID,
        issueDate: excelDateToDate(45420), // April 20, 2025
        dueDate: excelDateToDate(45420),
        notes: 'شاورما ستيشن - Class B'
      }
    ];

    const createdInvoices: Invoice[] = [];

    for (const invoiceInfo of invoiceData) {
      // Get client
      const client = await clientRepository.findOne({
        where: { code: invoiceInfo.clientCode }
      });

      if (!client) {
        logger.warn(`Client ${invoiceInfo.clientCode} not found, skipping invoice ${invoiceInfo.invoiceNumber}...`);
        continue;
      }

      // Check if invoice already exists
      const existingInvoice = await invoiceRepository.findOne({
        where: { invoiceNumber: invoiceInfo.invoiceNumber }
      });

      if (existingInvoice) {
        logger.log(`Invoice ${invoiceInfo.invoiceNumber} already exists, skipping...`);
        createdInvoices.push(existingInvoice);
        continue;
      }

      // Create invoice
      const invoice = invoiceRepository.create({
        ...invoiceInfo,
        clientId: client.id,
        createdBy: adminUser.id,
        createdByName: 'Admin User'
      });

      const savedInvoice = await invoiceRepository.save(invoice);
      createdInvoices.push(savedInvoice);
      logger.log(`Created invoice: ${invoiceInfo.invoiceNumber}`);
    }

    // =====================================================
    // 2. INVOICE ITEMS
    // =====================================================

    logger.log('Creating invoice items...');

    const invoiceItemsData = [
      // Invoice 891 - Hart Attack - Class A (2 cartons)
      {
        invoiceNumber: '891',
        items: [
          {
            productSku: 'INV-CLASS-A',
            productName: 'inventory class A',
            quantity: 2,
            unitPrice: 520.00,
            discount: 0.00,
            totalPrice: 1040.00
          }
        ]
      },
      // Invoice 892 - City Crepe - Class A (1 carton)
      {
        invoiceNumber: '892',
        items: [
          {
            productSku: 'INV-CLASS-A',
            productName: 'inventory class A',
            quantity: 1,
            unitPrice: 520.00,
            discount: 0.00,
            totalPrice: 520.00
          }
        ]
      },
      // Invoice 893 - Minzu Restaurant - Class B (1 carton)
      {
        invoiceNumber: '893',
        items: [
          {
            productSku: 'INV-CLASS-B',
            productName: 'inventory class B',
            quantity: 1,
            unitPrice: 450.00,
            discount: 0.00,
            totalPrice: 450.00
          }
        ]
      },
      // Invoice 894 - Samra Restaurant - Class A (2 cartons)
      {
        invoiceNumber: '894',
        items: [
          {
            productSku: 'INV-CLASS-A',
            productName: 'inventory class A',
            quantity: 2,
            unitPrice: 520.00,
            discount: 0.00,
            totalPrice: 1040.00
          }
        ]
      },
      // Invoice 895 - Dodge Restaurant - Class A (1 carton)
      {
        invoiceNumber: '895',
        items: [
          {
            productSku: 'INV-CLASS-A',
            productName: 'inventory class A',
            quantity: 1,
            unitPrice: 520.00,
            discount: 0.00,
            totalPrice: 520.00
          }
        ]
      },
      // Invoice 896 - Mini Pablo - Class A (1 carton)
      {
        invoiceNumber: '896',
        items: [
          {
            productSku: 'INV-CLASS-A',
            productName: 'inventory class A',
            quantity: 1,
            unitPrice: 520.00,
            discount: 0.00,
            totalPrice: 520.00
          }
        ]
      },
      // Invoice 897 - Hart Attack - Class B (3 cartons)
      {
        invoiceNumber: '897',
        items: [
          {
            productSku: 'INV-CLASS-B',
            productName: 'inventory class B',
            quantity: 3,
            unitPrice: 450.00,
            discount: 0.00,
            totalPrice: 1350.00
          }
        ]
      },
      // Invoice 898 - Piatto - Class B (2 cartons)
      {
        invoiceNumber: '898',
        items: [
          {
            productSku: 'INV-CLASS-B',
            productName: 'inventory class B',
            quantity: 2,
            unitPrice: 450.00,
            discount: 0.00,
            totalPrice: 900.00
          }
        ]
      },
      // Invoice 899 - Shawarma Station - Class A & B (1 carton each)
      {
        invoiceNumber: '899',
        items: [
          {
            productSku: 'INV-CLASS-A',
            productName: 'inventory class A',
            quantity: 1,
            unitPrice: 520.00,
            discount: 0.00,
            totalPrice: 520.00
          },
          {
            productSku: 'INV-CLASS-B',
            productName: 'inventory class B',
            quantity: 1,
            unitPrice: 450.00,
            discount: 0.00,
            totalPrice: 450.00
          }
        ]
      },
      // Invoice 900 - Town Burger - Class A (1 carton)
      {
        invoiceNumber: '900',
        items: [
          {
            productSku: 'INV-CLASS-A',
            productName: 'inventory class A',
            quantity: 1,
            unitPrice: 520.00,
            discount: 0.00,
            totalPrice: 520.00
          }
        ]
      },
      // Invoice 901 - Pizza Corners - Class A (1 carton)
      {
        invoiceNumber: '901',
        items: [
          {
            productSku: 'INV-CLASS-A',
            productName: 'inventory class A',
            quantity: 1,
            unitPrice: 520.00,
            discount: 0.00,
            totalPrice: 520.00
          }
        ]
      },
      // Invoice 902 - Shawarma Station - Class B (4 cartons)
      {
        invoiceNumber: '902',
        items: [
          {
            productSku: 'INV-CLASS-B',
            productName: 'inventory class B',
            quantity: 4,
            unitPrice: 450.00,
            discount: 0.00,
            totalPrice: 1800.00
          }
        ]
      },
      // Invoice 903 - Shawarma Station - Class B (4 cartons)
      {
        invoiceNumber: '903',
        items: [
          {
            productSku: 'INV-CLASS-B',
            productName: 'inventory class B',
            quantity: 4,
            unitPrice: 450.00,
            discount: 0.00,
            totalPrice: 1800.00
          }
        ]
      }
    ];

    for (const invoiceItemsInfo of invoiceItemsData) {
      const invoice = createdInvoices.find(i => i.invoiceNumber === invoiceItemsInfo.invoiceNumber);
      
      if (!invoice) {
        logger.warn(`Invoice ${invoiceItemsInfo.invoiceNumber} not found, skipping items...`);
        continue;
      }

      for (const itemInfo of invoiceItemsInfo.items) {
        // Get product
        const product = await productRepository.findOne({
          where: { sku: itemInfo.productSku }
        });

        if (!product) {
          logger.warn(`Product ${itemInfo.productSku} not found, skipping item...`);
          continue;
        }

        // Check if invoice item already exists
        const existingItem = await invoiceItemRepository.findOne({
          where: {
            invoiceId: invoice.id,
            productId: product.id
          }
        });

        if (existingItem) {
          logger.log(`Invoice item for ${itemInfo.productSku} in ${invoiceItemsInfo.invoiceNumber} already exists, skipping...`);
          continue;
        }

        // Create invoice item
        const invoiceItem = invoiceItemRepository.create({
          invoiceId: invoice.id,
          productId: product.id,
          productName: itemInfo.productName,
          productSku: itemInfo.productSku,
          quantity: itemInfo.quantity,
          unitPrice: itemInfo.unitPrice,
          discount: itemInfo.discount,
          totalPrice: itemInfo.totalPrice
        });

        await invoiceItemRepository.save(invoiceItem);
        logger.log(`Created invoice item: ${itemInfo.productSku} (${itemInfo.quantity} units)`);
      }
    }

    // =====================================================
    // 3. PAYMENTS
    // =====================================================

    logger.log('Creating payments...');

    const paymentData = [
      { invoiceNumber: '891', amount: 1040.00, processedAt: excelDateToDate(45415) },
      { invoiceNumber: '892', amount: 520.00, processedAt: excelDateToDate(45415) },
      { invoiceNumber: '893', amount: 450.00, processedAt: excelDateToDate(45415) },
      { invoiceNumber: '894', amount: 1040.00, processedAt: excelDateToDate(45416) },
      { invoiceNumber: '895', amount: 520.00, processedAt: excelDateToDate(45416) },
      { invoiceNumber: '896', amount: 520.00, processedAt: excelDateToDate(45416) },
      { invoiceNumber: '897', amount: 1350.00, processedAt: excelDateToDate(45417) },
      { invoiceNumber: '898', amount: 900.00, processedAt: excelDateToDate(45418) },
      { invoiceNumber: '899', amount: 970.00, processedAt: excelDateToDate(45418) },
      { invoiceNumber: '900', amount: 520.00, processedAt: excelDateToDate(45418) },
      { invoiceNumber: '901', amount: 520.00, processedAt: excelDateToDate(45418) },
      { invoiceNumber: '902', amount: 1800.00, processedAt: excelDateToDate(45419) },
      { invoiceNumber: '903', amount: 1800.00, processedAt: excelDateToDate(45420) }
    ];

    for (const paymentInfo of paymentData) {
      const invoice = createdInvoices.find(i => i.invoiceNumber === paymentInfo.invoiceNumber);
      
      if (!invoice) {
        logger.warn(`Invoice ${paymentInfo.invoiceNumber} not found, skipping payment...`);
        continue;
      }

      // Check if payment already exists
      const existingPayment = await paymentRepository.findOne({
        where: {
          invoiceId: invoice.id,
          amount: paymentInfo.amount
        }
      });

      if (existingPayment) {
        logger.log(`Payment for invoice ${paymentInfo.invoiceNumber} already exists, skipping...`);
        continue;
      }

      // Create payment
      const payment = paymentRepository.create({
        invoiceId: invoice.id,
        amount: paymentInfo.amount,
        method: PaymentMethod.CASH,
        reference: `PAY-${paymentInfo.invoiceNumber}`,
        notes: `Cash payment for invoice ${paymentInfo.invoiceNumber}`,
        processedBy: adminUser.id,
        processedByName: 'Admin User',
        processedAt: paymentInfo.processedAt
      });

      await paymentRepository.save(payment);
      logger.log(`Created payment: ${paymentInfo.amount} EGP for invoice ${paymentInfo.invoiceNumber}`);
    }

    // =====================================================
    // 4. UPDATE PRODUCT STOCK LEVELS
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
      // Calculate total sold quantity for this product
      const totalSold = await invoiceItemRepository
        .createQueryBuilder('ii')
        .innerJoin('ii.invoice', 'i')
        .where('ii.productId = :productId', { productId: product.id })
        .andWhere('i.paymentStatus = :status', { status: PaymentStatus.PAID })
        .select('SUM(ii.quantity)', 'total')
        .getRawOne();

      const soldQty = parseInt(totalSold?.total || '0');
      
      if (soldQty > 0) {
        product.stock -= soldQty;
        await productRepository.save(product);
        logger.log(`Updated stock for ${product.sku}: -${soldQty} units (new total: ${product.stock})`);
      }
    }

    // =====================================================
    // 5. VERIFICATION
    // =====================================================

    logger.log('Verifying inserted data...');

    const invoiceCount = await invoiceRepository.count({
      where: { invoiceNumber: { in: ['891', '892', '893', '894', '895', '896', '897', '898', '899', '900', '901', '902', '903'] } }
    });

    const invoiceItemCount = await invoiceItemRepository
      .createQueryBuilder('ii')
      .innerJoin('ii.invoice', 'i')
      .where('i.invoiceNumber IN (:...numbers)', { 
        numbers: ['891', '892', '893', '894', '895', '896', '897', '898', '899', '900', '901', '902', '903'] 
      })
      .getCount();

    const paymentCount = await paymentRepository
      .createQueryBuilder('p')
      .innerJoin('p.invoice', 'i')
      .where('i.invoiceNumber IN (:...numbers)', { 
        numbers: ['891', '892', '893', '894', '895', '896', '897', '898', '899', '900', '901', '902', '903'] 
      })
      .getCount();

    const totalSalesValue = await invoiceRepository
      .createQueryBuilder('i')
      .where('i.invoiceNumber IN (:...numbers)', { 
        numbers: ['891', '892', '893', '894', '895', '896', '897', '898', '899', '900', '901', '902', '903'] 
      })
      .select('SUM(i.totalAmount)', 'total')
      .getRawOne();

    console.log('\n=== INVOICE DATA INSERTION SUMMARY ===');
    console.table([
      { Metric: 'Invoices Created', Value: invoiceCount },
      { Metric: 'Invoice Items Created', Value: invoiceItemCount },
      { Metric: 'Payments Created', Value: paymentCount },
      { Metric: 'Total Sales Value (EGP)', Value: parseFloat(totalSalesValue?.total || '0').toFixed(2) }
    ]);

    console.log('\n✅ Invoice data insertion completed successfully!');
    console.log('\n📋 Invoice Summary:');
    console.log('1. Invoice 891: Hart Attack - Class A (2 cartons) = 1,040 EGP');
    console.log('2. Invoice 892: City Crepe - Class A (1 carton) = 520 EGP');
    console.log('3. Invoice 893: Minzu Restaurant - Class B (1 carton) = 450 EGP');
    console.log('4. Invoice 894: Samra Restaurant - Class A (2 cartons) = 1,040 EGP');
    console.log('5. Invoice 895: Dodge Restaurant - Class A (1 carton) = 520 EGP');
    console.log('6. Invoice 896: Mini Pablo - Class A (1 carton) = 520 EGP');
    console.log('7. Invoice 897: Hart Attack - Class B (3 cartons) = 1,350 EGP');
    console.log('8. Invoice 898: Piatto - Class B (2 cartons) = 900 EGP');
    console.log('9. Invoice 899: Shawarma Station - Class A & B (1 each) = 970 EGP');
    console.log('10. Invoice 900: Town Burger - Class A (1 carton) = 520 EGP');
    console.log('11. Invoice 901: Pizza Corners - Class A (1 carton) = 520 EGP');
    console.log('12. Invoice 902: Shawarma Station - Class B (4 cartons) = 1,800 EGP');
    console.log('13. Invoice 903: Shawarma Station - Class B (4 cartons) = 1,800 EGP');
    console.log(`Total: ${parseFloat(totalSalesValue?.total || '0').toFixed(2)} EGP`);

  } catch (error) {
    console.error('❌ Error during invoice data insertion:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap(); 