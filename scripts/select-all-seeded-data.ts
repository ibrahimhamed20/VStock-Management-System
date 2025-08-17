import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Logger } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

// Import all entities
import { User } from '../src/users/entities/user.entity';
import { Role } from '../src/users/entities/role.entity';
import { Client } from '../src/clients/entities/client.entity';
import { Product } from '../src/inventory/entities/product.entity';
import { Supplier } from '../src/purchasing/entities/supplier.entity';
import { Purchase } from '../src/purchasing/entities/purchase.entity';
import { PurchaseItem } from '../src/purchasing/entities/purchase-item.entity';
import { Invoice } from '../src/sales/entities/invoice.entity';
import { InvoiceItem } from '../src/sales/entities/invoice-item.entity';
import { Payment } from '../src/sales/entities/payment.entity';
import { Account } from '../src/accounting/entities/account.entity';
import { JournalEntry } from '../src/accounting/entities/journal-entry.entity';

async function bootstrap() {
  console.log('🔍 Starting comprehensive data selection...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('DataSelector');

  try {
    // Get repositories from the app context
    const userRepository = app.get(getRepositoryToken(User));
    const roleRepository = app.get(getRepositoryToken(Role));
    const clientRepository = app.get(getRepositoryToken(Client));
    const productRepository = app.get(getRepositoryToken(Product));
    const supplierRepository = app.get(getRepositoryToken(Supplier));
    const purchaseRepository = app.get(getRepositoryToken(Purchase));
    const purchaseItemRepository = app.get(getRepositoryToken(PurchaseItem));
    const invoiceRepository = app.get(getRepositoryToken(Invoice));
    const invoiceItemRepository = app.get(getRepositoryToken(InvoiceItem));
    const paymentRepository = app.get(getRepositoryToken(Payment));
    const accountRepository = app.get(getRepositoryToken(Account));
    const journalEntryRepository = app.get(getRepositoryToken(JournalEntry));

    // =====================================================
    // 1. ROLES
    // =====================================================
    console.log('\n=== ROLES ===');
    const roles = await roleRepository.find({
      order: { code: 'ASC' }
    });

    if (roles.length > 0) {
      console.table(roles.map(role => ({
        id: role.id,
        code: role.code,
        name: role.name,
        description: role.description,
        created_at: role.createdAt,
        updated_at: role.updatedAt
      })));
    } else {
      console.log('❌ No roles found');
    }

    // =====================================================
    // 2. USERS
    // =====================================================
    console.log('\n=== USERS ===');
    const users = await userRepository.find({
      order: { username: 'ASC' }
    });

    if (users.length > 0) {
      console.table(users.map(user => ({
        id: user.id,
        code: user.code,
        username: user.username,
        email: user.email,
        status: user.status,
        created_at: user.createdAt,
        updated_at: user.updatedAt
      })));
    } else {
      console.log('❌ No users found');
    }

    // =====================================================
    // 3. CLIENTS
    // =====================================================
    console.log('\n=== CLIENTS ===');
    const clientNames = [
      'هارت اتاك', 'سيتي كريب', 'مطعم مينزو', 'مطعم سمره', 'Piatto',
      'The garden', 'شاورما ستيشن', 'تاون برجر', 'بيتزا كورنرز',
      'توب شيش', 'الكوثر', 'حواوشي الرفاعي', 'محمد العدوي',
      'مطعم دودج', 'عرباوى', 'امريكان دريمز', 'دودج', 'عيسى روزا',
      'البيت السورى', 'ديب فرايز', 'داليدا', 'اكس بيتزا',
      'حسام', 'بوينت ناين'
    ];

    const clients = await clientRepository.find({
      order: { name: 'ASC' }
    });

    if (clients.length > 0) {
      console.table(clients.map(client => ({
        id: client.id,
        code: client.code,
        name: client.name,
        email: client.email,
        phone: client.phone,
        created_at: client.createdAt,
        updated_at: client.updatedAt
      })));
    } else {
      console.log('❌ No clients found');
    }

    // =====================================================
    // 4. PRODUCTS
    // =====================================================
    console.log('\n=== PRODUCTS ===');
    const productSkus = [
      'INV-CLASS-A', 'INV-CLASS-B', 'INV-CLASS-B-300', 'INV-CLASS-C',
      'INV-CLASS-B-HANEN', 'INV-CLASS-B-321', 'INV-CLASS-A-401'
    ];

    const products = await productRepository.find({
      order: { sku: 'ASC' }
    });

    if (products.length > 0) {
      console.table(products.map(product => ({
        id: product.id,
        code: product.code,
        sku: product.sku,
        name: product.name,
        description: product.description,
        unit_cost: product.unitCost,
        selling_price: product.sellingPrice,
        stock: product.stock,
        classification: product.classification,
        category: product.category,
        supplier: product.supplier,
        created_at: product.createdAt,
        updated_at: product.updatedAt
      })));
    } else {
      console.log('❌ No products found');
    }

    // =====================================================
    // 5. ACCOUNTS (Chart of Accounts)
    // =====================================================
    console.log('\n=== ACCOUNTS ===');
    const accountCodes = [
      // Assets
      '1', '11', '111', '12', '13', '14', '141', '142', '143', '144', '145', '146', '147', '15', '16', '161', '162', '17',
      // Equity
      '2', '21', '211', '212', '213', '22', '23',
      // Liabilities
      '3', '31', '32', '33',
      // Sales
      '51', '511', '512', '513', '514', '515', '516', '517', '518', '519',
      // COGS
      '52', '521', '522', '523', '524', '525', '526', '527', '528',
      // Expenses
      '53', '531', '532', '533', '534'
    ];

    const accounts = await accountRepository.find({
      order: { code: 'ASC' }
    });

    if (accounts.length > 0) {
      console.table(accounts.map(account => ({
        id: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        balance: account.balance,
        created_at: account.createdAt,
        updated_at: account.updatedAt
      })));
    } else {
      console.log('❌ No accounts found');
    }

    // =====================================================
    // 6. SUPPLIERS
    // =====================================================
    console.log('\n=== SUPPLIERS ===');
    const suppliers = await supplierRepository.find({
    });

    if (suppliers.length > 0) {
      console.table(suppliers.map(supplier => ({
        id: supplier.id,
        code: supplier.code,
        name: supplier.name,
        contact_person: supplier.contactPerson,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        status: supplier.status,
        created_at: supplier.createdAt,
        updated_at: supplier.updatedAt
      })));
    } else {
      console.log('❌ No suppliers found');
    }

    // =====================================================
    // 7. PURCHASES (if they exist)
    // =====================================================
    console.log('\n=== PURCHASES ===');
    const purchases = await purchaseRepository.find({
      order: { purchaseNumber: 'ASC' }
    });

    if (purchases.length > 0) {
      console.table(purchases.map(purchase => ({
        id: purchase.id,
        purchase_number: purchase.purchaseNumber,
        supplier_id: purchase.supplierId,
        total_amount: purchase.totalAmount,
        order_date: purchase.orderDate,
        expected_delivery_date: purchase.expectedDeliveryDate,
        actual_delivery_date: purchase.actualDeliveryDate,
        purchase_status: purchase.purchaseStatus,
        payment_status: purchase.paymentStatus,
        created_at: purchase.createdAt,
        updated_at: purchase.updatedAt
      })));
    } else {
      console.log('❌ No purchases found');
    }

    // =====================================================
    // 8. INVOICES (if they exist)
    // =====================================================
    console.log('\n=== INVOICES ===');
    const invoices = await invoiceRepository.find({
      order: { invoiceNumber: 'ASC' }
    });

    if (invoices.length > 0) {
      console.table(invoices.map(invoice => ({
        id: invoice.id,
        invoice_number: invoice.invoiceNumber,
        client_id: invoice.clientId,
        total_amount: invoice.totalAmount,
        issue_date: invoice.issueDate,
        due_date: invoice.dueDate,
        payment_status: invoice.paymentStatus,
        created_at: invoice.createdAt,
        updated_at: invoice.updatedAt
      })));
    } else {
      console.log('❌ No invoices found');
    }

    // =====================================================
    // 9. JOURNAL ENTRIES (if they exist)
    // =====================================================
    console.log('\n=== JOURNAL ENTRIES ===');
    const journalEntries = await journalEntryRepository.find({
      order: { reference: 'ASC' }
    });

    if (journalEntries.length > 0) {
      console.table(journalEntries.map(entry => ({
        id: entry.id,
        date: entry.date,
        reference: entry.reference,
        description: entry.description,
        created_at: entry.createdAt,
        updated_at: entry.updatedAt
      })));
    } else {
      console.log('❌ No journal entries found');
    }

    // =====================================================
    // 10. SUMMARY COUNTS
    // =====================================================
    console.log('\n=== SUMMARY COUNTS ===');

    const roleCount = await roleRepository.count();

    const userCount = await userRepository.count();

    const clientCount = await clientRepository.count();

    const productCount = await productRepository.count();

    const accountCount = await accountRepository.count();

    const supplierCount = await supplierRepository.count();

    const purchaseCount = await purchaseRepository.count();

    const invoiceCount = await invoiceRepository.count();

    const journalEntryCount = await journalEntryRepository.count();

    const summary = [
      { Entity: 'Roles', Count: roleCount, Expected: 4 },
      { Entity: 'Users', Count: userCount, Expected: 5 },
      { Entity: 'Clients', Count: clientCount, Expected: 24 },
      { Entity: 'Products', Count: productCount, Expected: 7 },
      { Entity: 'Accounts', Count: accountCount, Expected: 47 },
      { Entity: 'Suppliers', Count: supplierCount, Expected: 1 },
      { Entity: 'Purchases', Count: purchaseCount, Expected: 0 },
      { Entity: 'Invoices', Count: invoiceCount, Expected: 0 },
      { Entity: 'Journal Entries', Count: journalEntryCount, Expected: 0 }
    ];

    console.table(summary);

    // =====================================================
    // 11. DATA VALIDATION CHECKS
    // =====================================================
    console.log('\n=== DATA VALIDATION CHECKS ===');

    const missingRoles = 4 - roleCount;
    const missingUsers = 5 - userCount;
    const missingClients = 24 - clientCount;
    const missingProducts = 7 - productCount;
    const missingAccounts = 47 - accountCount;
    const missingSuppliers = 1 - supplierCount;

    const validation = [
      { Check: 'Missing Roles', Count: missingRoles, Status: missingRoles === 0 ? '✅' : '❌' },
      { Check: 'Missing Users', Count: missingUsers, Status: missingUsers === 0 ? '✅' : '❌' },
      { Check: 'Missing Clients', Count: missingClients, Status: missingClients === 0 ? '✅' : '❌' },
      { Check: 'Missing Products', Count: missingProducts, Status: missingProducts === 0 ? '✅' : '❌' },
      { Check: 'Missing Accounts', Count: missingAccounts, Status: missingAccounts === 0 ? '✅' : '❌' },
      { Check: 'Missing Suppliers', Count: missingSuppliers, Status: missingSuppliers === 0 ? '✅' : '❌' }
    ];

    console.table(validation);

    const totalMissing = missingRoles + missingUsers + missingClients + missingProducts + missingAccounts + missingSuppliers;

    if (totalMissing === 0) {
      console.log('\n🎉 All seeded data is present!');
    } else {
      console.log(`\n⚠️  Found ${totalMissing} missing items. Please check the seeding process.`);
    }

    console.log('\n✅ Data selection completed successfully!');
  } catch (error) {
    console.error('❌ Error during data selection:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap(); 