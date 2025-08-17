import { DataSource } from 'typeorm';
import { Permission } from '../src/users/entities/permission.entity';
import { Role } from '../src/users/entities/role.entity';
import { User } from '../src/users/entities/user.entity';
import { UserLoginHistory } from '../src/users/entities/user-login-history.entity';
import { config as dotenvConfig } from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenvConfig();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Permission, Role, User, UserLoginHistory],
  synchronize: false,
});

// Comprehensive permissions based on ALL APIs in your backend
const permissions = [
  // ===== AUTH MODULE =====
  { name: 'auth.login', description: 'User login' },
  { name: 'auth.register', description: 'User registration' },
  { name: 'auth.refresh', description: 'Refresh access token' },
  { name: 'auth.logout', description: 'User logout' },
  { name: 'auth.reset-password-request', description: 'Request password reset' },
  { name: 'auth.reset-password', description: 'Reset password with token' },
  { name: 'auth.change-password', description: 'Change user password' },
  { name: 'auth.verify-email', description: 'Verify email address' },
  { name: 'auth.resend-verification', description: 'Resend email verification' },

  // ===== USERS MODULE =====
  { name: 'users.create', description: 'Create new user' },
  { name: 'users.read', description: 'View all users' },
  { name: 'users.read.by-id', description: 'View user by ID' },
  { name: 'users.read.by-username', description: 'View user by username' },
  { name: 'users.read.by-role', description: 'View users by role' },
  { name: 'users.read.by-status', description: 'View users by status' },
  { name: 'users.update', description: 'Update user information' },
  { name: 'users.update.status', description: 'Update user status' },
  { name: 'users.delete', description: 'Delete user' },
  { name: 'users.assign-role', description: 'Assign roles to user' },
  { name: 'users.read.login-history', description: 'View user login history' },
  { name: 'users.record-login', description: 'Record user login' },
  { name: 'users.read.profile', description: 'View own profile' },
  { name: 'users.update.profile', description: 'Update own profile' },

  // ===== ROLES MODULE =====
  { name: 'roles.create', description: 'Create new role' },
  { name: 'roles.read', description: 'View all roles' },
  { name: 'roles.read.by-id', description: 'View role by ID' },
  { name: 'roles.update', description: 'Update role' },
  { name: 'roles.delete', description: 'Delete role' },
  { name: 'roles.read.permission-matrix', description: 'View permission matrix' },
  { name: 'roles.assign.users', description: 'Assign users to role' },
  { name: 'roles.remove.users', description: 'Remove users from role' },
  { name: 'roles.assign.permissions', description: 'Assign permissions to role' },
  { name: 'roles.remove.permissions', description: 'Remove permissions from role' },

  // ===== PERMISSIONS MODULE =====
  { name: 'permissions.create', description: 'Create new permission' },
  { name: 'permissions.read', description: 'View all permissions' },
  { name: 'permissions.read.by-id', description: 'View permission by ID' },
  { name: 'permissions.update', description: 'Update permission' },
  { name: 'permissions.delete', description: 'Delete permission' },

  // ===== CLIENTS MODULE =====
  { name: 'clients.create', description: 'Create new client' },
  { name: 'clients.read', description: 'View all clients' },
  { name: 'clients.read.by-id', description: 'View client by ID' },
  { name: 'clients.update', description: 'Update client' },
  { name: 'clients.delete', description: 'Delete client' },
  { name: 'clients.add.tags', description: 'Add tags to client' },
  { name: 'clients.remove.tags', description: 'Remove tags from client' },
  { name: 'clients.add.transactions', description: 'Add transaction to client' },
  { name: 'clients.read.transactions', description: 'View client transaction history' },
  { name: 'clients.read.by-tag', description: 'View clients by tag' },

  // ===== SALES MODULE =====
  { name: 'sales.invoices.create', description: 'Create invoice' },
  { name: 'sales.invoices.read', description: 'View all invoices' },
  { name: 'sales.invoices.read.by-id', description: 'View invoice by ID' },
  { name: 'sales.invoices.read.by-number', description: 'View invoice by number' },
  { name: 'sales.invoices.read.by-client', description: 'View invoices by client' },
  { name: 'sales.invoices.read.by-status', description: 'View invoices by status' },
  { name: 'sales.invoices.update', description: 'Update invoice' },
  { name: 'sales.invoices.delete', description: 'Delete invoice' },
  { name: 'sales.invoices.cancel', description: 'Cancel invoice' },
  { name: 'sales.invoices.mark-overdue', description: 'Mark invoice as overdue' },
  { name: 'sales.invoices.next-number', description: 'Get next invoice number' },
  { name: 'sales.payments.create', description: 'Create payment' },
  { name: 'sales.payments.read.by-invoice', description: 'View payments by invoice' },
  { name: 'sales.reports.sales', description: 'View sales report' },
  { name: 'sales.reports.overdue', description: 'View overdue invoices report' },
  { name: 'sales.reports.dashboard', description: 'View sales dashboard' },
  { name: 'sales.analytics.top-products', description: 'View top products analytics' },
  { name: 'sales.analytics.sales-trend', description: 'View sales trend analytics' },
  { name: 'sales.analytics.payment-methods', description: 'View payment method statistics' },
  { name: 'sales.analytics.client-performance', description: 'View client performance analytics' },
  { name: 'sales.search.invoices', description: 'Search invoices' },

  // ===== INVENTORY MODULE =====
  { name: 'inventory.products.create', description: 'Create product' },
  { name: 'inventory.products.read', description: 'View all products' },
  { name: 'inventory.products.read.by-id', description: 'View product by ID' },
  { name: 'inventory.products.read.by-sku', description: 'View product by SKU' },
  { name: 'inventory.products.update', description: 'Update product' },
  { name: 'inventory.products.delete', description: 'Delete product' },
  { name: 'inventory.stock.adjust', description: 'Adjust stock levels' },
  { name: 'inventory.stock.read.low-stock', description: 'View low stock products' },
  { name: 'inventory.stock.read.movements', description: 'View stock movements' },
  { name: 'inventory.batches.create', description: 'Create batch' },
  { name: 'inventory.batches.read.by-product', description: 'View batches by product' },
  { name: 'inventory.batches.read.expiring', description: 'View expiring batches' },
  { name: 'inventory.reports.abc-classification', description: 'View ABC classification report' },
  { name: 'inventory.reports.stock-value', description: 'View stock value report' },
  { name: 'inventory.reports.stock-alerts', description: 'View stock alerts' },
  { name: 'inventory.search.products', description: 'Search products' },
  { name: 'inventory.read.categories', description: 'View product categories' },
  { name: 'inventory.read.suppliers', description: 'View suppliers' },

  // ===== PURCHASING MODULE =====
  { name: 'purchasing.purchases.create', description: 'Create purchase order' },
  { name: 'purchasing.purchases.read', description: 'View all purchases' },
  { name: 'purchasing.purchases.read.by-id', description: 'View purchase by ID' },
  { name: 'purchasing.purchases.read.by-supplier', description: 'View purchases by supplier' },
  { name: 'purchasing.purchases.read.by-status', description: 'View purchases by status' },
  { name: 'purchasing.purchases.update', description: 'Update purchase' },
  { name: 'purchasing.purchases.delete', description: 'Delete purchase' },
  { name: 'purchasing.purchases.approve', description: 'Approve purchase' },
  { name: 'purchasing.purchases.reject', description: 'Reject purchase' },
  { name: 'purchasing.purchases.receive', description: 'Receive purchase items' },
  { name: 'purchasing.suppliers.create', description: 'Create supplier' },
  { name: 'purchasing.suppliers.read', description: 'View all suppliers' },
  { name: 'purchasing.suppliers.read.by-id', description: 'View supplier by ID' },
  { name: 'purchasing.suppliers.update', description: 'Update supplier' },
  { name: 'purchasing.suppliers.delete', description: 'Delete supplier' },
  { name: 'purchasing.reports.purchases', description: 'View purchase reports' },
  { name: 'purchasing.reports.supplier-performance', description: 'View supplier performance' },
  { name: 'purchasing.analytics.spending-trend', description: 'View spending trend analytics' },
  { name: 'purchasing.search.purchases', description: 'Search purchases' },

  // ===== ACCOUNTING MODULE =====
  { name: 'accounting.accounts.read', description: 'View chart of accounts' },
  { name: 'accounting.accounts.create', description: 'Create account' },
  { name: 'accounting.journal-entries.read', description: 'View journal entries' },
  { name: 'accounting.journal-entries.create', description: 'Create journal entry' },
  { name: 'accounting.general-ledger.read', description: 'View general ledger' },
  { name: 'accounting.trial-balance.read', description: 'View trial balance' },

  // ===== SETTINGS MODULE =====
  { name: 'settings.read', description: 'View system settings' },
  { name: 'settings.update', description: 'Update system settings' },

  // ===== REPORTS MODULE =====
  { name: 'reports.create', description: 'Create custom report' },
  { name: 'reports.read', description: 'View all reports' },
  { name: 'reports.read.by-id', description: 'View report by ID' },
  { name: 'reports.update', description: 'Update report' },
  { name: 'reports.delete', description: 'Delete report' },
  { name: 'reports.export', description: 'Export report' },
  { name: 'reports.schedule', description: 'Schedule report generation' },

  // ===== AI MODULE =====
  { name: 'ai.forecast', description: 'Generate sales forecast' },
  { name: 'ai.ask', description: 'Ask AI question' },
  { name: 'ai.summary', description: 'Generate AI summary' },
  { name: 'ai.recommend', description: 'Get AI recommendations' },
  { name: 'ai.anomaly', description: 'Detect anomalies' },

  // ===== SYSTEM/APP MODULE =====
  { name: 'system.health.read', description: 'View system health' },
  { name: 'system.info.read', description: 'View system information' },
  { name: 'system.api.read', description: 'View API information' },
  { name: 'system.status.read', description: 'View system status' },
  { name: 'system.docs.read', description: 'View API documentation' },
];

async function seedAllPermissions() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    const permissionRepository = AppDataSource.getRepository(Permission);
    const roleRepository = AppDataSource.getRepository(Role);
    const userRepository = AppDataSource.getRepository(User);

    // Seed permissions
    for (const permissionData of permissions) {
      const existingPermission = await permissionRepository.findOne({
        where: { name: permissionData.name }
      });
      if (!existingPermission) {
        const permission = permissionRepository.create(permissionData);
        await permissionRepository.save(permission);
        console.log(`✅ Created permission: ${permissionData.name}`);
      } else {
        console.log(`⏭️  Permission already exists: ${permissionData.name}`);
      }
    }
    const allPermissions = await permissionRepository.find();
    const totalPermissions = allPermissions.length;
    console.log(`\n🎉 Seeding complete! Total permissions in database: ${totalPermissions}`);

    // Create admin role if not exists
    let adminRole = await roleRepository.findOne({ where: { name: 'admin' }, relations: ['permissions'] });
    if (!adminRole) {
      adminRole = roleRepository.create({ name: 'admin', description: 'Administrator with full access', permissions: allPermissions });
      await roleRepository.save(adminRole);
      // Reload to get the id and relations
      adminRole = await roleRepository.findOne({ where: { name: 'admin' }, relations: ['permissions'] });
      console.log('✅ Created admin role and assigned all permissions');
    } else {
      // Assign all permissions if not already assigned
      const missingPerms = allPermissions.filter(p => !adminRole!.permissions.some(ap => ap.id === p.id));
      if (missingPerms.length > 0) {
        adminRole.permissions = [...adminRole.permissions, ...missingPerms];
        await roleRepository.save(adminRole);
        // Reload to get updated relations
        adminRole = await roleRepository.findOne({ where: { name: 'admin' }, relations: ['permissions'] });
        console.log('✅ Updated admin role with missing permissions');
      } else {
        console.log('⏭️  Admin role already has all permissions');
      }
    }
    if (!adminRole) {
      throw new Error('Admin role could not be created or loaded.');
    }

    // Create admin user if not exists
    const adminEmail = 'admin@example.com';
    const adminUsername = 'admin';
    const adminPassword = 'Admin123!';
    let adminUser = await userRepository.findOne({ where: [{ email: adminEmail }, { username: adminUsername }], relations: ['roles'] });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      adminUser = userRepository.create({
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        status: 'active',
        roles: [adminRole],
      });
      await userRepository.save(adminUser);
      console.log('✅ Created admin user and assigned admin role');
    } else {
      // Assign admin role if not already assigned
      if (!adminUser.roles.some(r => r.id === adminRole.id)) {
        adminUser.roles.push(adminRole);
        await userRepository.save(adminUser);
        console.log('✅ Assigned admin role to existing admin user');
      } else {
        console.log('⏭️  Admin user already has admin role');
      }
    }

  } catch (error) {
    console.error('❌ Error seeding permissions, roles, or admin user:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
}

// Run the seeding
seedAllPermissions()
  .then(() => {
    console.log('✅ Permission seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Permission seeding failed:', error);
    process.exit(1);
  }); 