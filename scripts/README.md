# Database Seeding Scripts

This directory contains scripts to populate your database with sample business data based on your actual Excel business data.

## 📁 Files Overview

### `seed-business-data-fixed.sql`
**Fixed seed file for UUIDs** - Comprehensive SQL script with your actual business data that properly handles auto-generated UUIDs:
- **UUID Handling**: Uses CTEs (Common Table Expressions) to capture generated UUIDs for proper foreign key relationships
- **No Hardcoded IDs**: Removes all hardcoded string IDs that conflict with auto-generated UUIDs
- **Proper Relationships**: Establishes correct foreign key relationships using generated UUIDs

### `seed-business-data.ts`
**Simple TypeScript business data seed script** - Uses direct TypeORM DataSource for reliable seeding:
- **Lightweight**: No NestJS bootstrap - uses direct database connection
- **Type Safety**: Full TypeScript support with proper entity types
- **Upsert Behavior**: Skip if exists, create if not found (like permissions seed)
- **Complete Business Data**: Seeds all business entities including:
  - Suppliers, Clients, Products, Accounts, Settings
  - Purchases, Purchase Items, Batches, Stock Movements
  - Invoices, Invoice Items, Payments
- **Error Handling**: Comprehensive error handling and logging
- **Reliable**: Same approach as `seed-all-permissions.ts` - proven to work
- **No Users/Roles**: Users and roles are handled separately by `seed-all-permissions.ts`

### `seed-business-data.sql`
**Original seed file** - Contains hardcoded IDs (may cause UUID conflicts):
- **Users & Roles**: Business owners (Mostafa, Karim, Mohamed) and staff
- **Suppliers**: Tunkaya (your actual supplier)
- **Clients**: 23 Arabic restaurant names from your Excel (هارت اتاك, سيتي كريب, etc.)
- **Products**: 7 inventory classes (A, B, B-300, C, B-hanen, B-321, A-401) with actual costs and prices
- **Chart of Accounts**: Complete 35-account structure with proper codes
- **Transactions**: Real sales data from April 2025, purchase orders, payments
- **Double-Entry Accounting**: Journal entries matching your Excel structure
- **Inventory**: Stock movements and batches with actual quantities

### `run-sql-seed-local.ps1`
PowerShell script to run the fixed SQL seed file with local PostgreSQL server.

### `run-sql-seed-fixed.bat`
Batch script alternative for running the fixed SQL seed file.

## 🚀 Quick Start

### Option 1: Complete seeding (Recommended)
```bash
# First: Seed roles and permissions
npm run seed:roles

# Then: Seed business data
npm run seed:business
```

### Option 2: Business data only (if roles already exist)
```bash
npm run seed:business
```

### Option 2: Using TypeScript script with force override
```bash
npm run seed:business:force
```

### Option 3: Using SQL script
```bash
npm run seed:sql:local
```

### Option 2: Direct PowerShell execution
```powershell
powershell -ExecutionPolicy Bypass -File scripts/run-sql-seed-local.ps1
```

### Option 3: Manual execution
```bash
psql -h localhost -p 5432 -U postgres -d store_management_db -f scripts/seed-business-data-fixed.sql
```

## ⚙️ Configuration

Before running, update the database connection settings in `run-sql-seed-local.ps1` or `run-sql-seed-fixed.bat`:

```powershell
$PG_HOST = "localhost"
$PG_PORT = "5432"
$PG_USER = "postgres"
$PG_PASSWORD = "root"  # Change to your actual password
$PG_DATABASE = "store_management_db"
```

## 📊 Data Included

### Users & Authentication
- **Users and roles** are created by `seed-all-permissions.ts`
- **Admin user**: admin@example.com with password `Admin123!`
- **Comprehensive permissions** system with role-based access control

### Business Data
- **1 Supplier**: Tunkaya (your actual supplier)
- **23 Clients**: All Arabic restaurant names from your Excel
- **7 Products**: Inventory classes with actual costs and selling prices
- **35 Accounts**: Complete chart of accounts with proper codes
- **4 Purchases**: Complete purchase orders with items
- **4 Purchase Items**: Detailed purchase line items
- **4 Batches**: Product batch tracking with expiry dates
- **4 Stock Movements**: Inventory movement tracking
- **3 Invoices**: Sales invoices with items
- **3 Invoice Items**: Detailed invoice line items
- **3 Payments**: Payment records with different methods
- **3 Journal Entries**: Double-entry accounting entries

### Transactions
- **4 Purchase Orders**: Complete purchase orders with delivery tracking
- **4 Purchase Items**: Detailed line items for each purchase
- **4 Batches**: Product batches with expiry and manufacturing dates
- **4 Stock Movements**: Inventory movements for purchases
- **3 Invoices**: Sales invoices with payment status
- **3 Invoice Items**: Detailed line items for each invoice
- **3 Payments**: Payment records with different payment methods
- **3 Journal Entries**: Double-entry accounting entries for sales

## 🔑 Login Credentials

**From `seed-all-permissions.ts`:**
| Username | Password | Role |
|----------|----------|------|
| admin | Admin123! | Admin (with all permissions) |

**Note:** Additional users can be created through the application interface or by modifying the permissions seed script.

## 📈 Business Metrics (Based on Your Excel Data)

- **Total Sales**: 208,170 EGP
- **Net Profit**: 35,135 EGP
- **Assets**: 329,531 EGP
- **Working Capital**: 134,531 EGP
- **Cash**: 17,245 EGP
- **Accounts Receivable**: 13,110 EGP

## 🏪 Inventory Classes

| Class | Cost (EGP) | Selling Price (EGP) | Initial Stock |
|-------|------------|-------------------|---------------|
| Class A | 395.00 | 520.00 | 100 |
| Class B | 310.00 | 450.00 | 100 |
| Class B-300 | 300.00 | 420.00 | 42 |
| Class C | 200.00 | 280.00 | 158 |
| Class B-hanen | 315.00 | 440.00 | 257 |
| Class B-321 | 321.35 | 450.00 | 128 |
| Class A-401 | 401.35 | 520.00 | 50 |

## 🏢 Major Clients

- هارت اتاك (Hart Attack)
- سيتي كريب (City Crepe)
- مطعم مينزو (Minzu Restaurant)
- شاورما ستيشن (Shawarma Station)
- تاون برجر (Town Burger)
- بيتزا كورنرز (Pizza Corners)
- And 17 more restaurants...

## 💰 Chart of Accounts Structure

### Assets (1xxx)
- Fixed Assets (11): Fridge, Depreciation
- Current Assets (13): Inventory, Accounts Receivable, Cash, Prepaid Expenses

### Equity (2xxx)
- Capital (21): Mostafa Ibrahem, Karim Ayman, Mohamed eladawy
- Retained Earnings (22), Net Profit (23)

### Liabilities (3xxx)
- Current Liabilities (31): Accounts Payable, Taxes, Accrued Expenses

### Revenue (5xxx)
- Sales (51): Class A, B, B-300, C, B-hanen, B-321, A-401, Discounts

### Expenses (52xx, 53xx)
- COGS (52): Class A, B, B-300, C, B-hanen, B-321, A-401, Delivery
- Operating Expenses (53): Electricity, Rent, Prepaid, Other

## 🔧 Troubleshooting

### UUID Issues
1. **"invalid input syntax for type uuid"**: Use `seed-business-data-fixed.sql` instead of the original file
2. **"duplicate key value violates unique constraint"**: The fixed version handles UUIDs properly
3. **Foreign key violations**: CTEs ensure proper relationships between generated UUIDs

### Connection Issues
1. **PostgreSQL not running**: Start your PostgreSQL service
2. **Database doesn't exist**: Run `createdb -h localhost -p 5432 -U postgres store_management_db`
3. **Wrong password**: Update `$PG_PASSWORD` in the script
4. **psql not found**: Install PostgreSQL or add to PATH

### Data Issues
1. **Duplicate key errors**: The script checks for existing data and asks before proceeding
2. **Foreign key violations**: All relationships are properly maintained
3. **Permission errors**: Ensure your PostgreSQL user has full access to the database

### Performance
- The script includes proper indexes and constraints
- Large datasets are inserted efficiently
- Transaction integrity is maintained

## 📝 Customization

### Adding More Data
1. Edit `seed-business-data.sql` to add more records
2. Follow the existing pattern for proper relationships
3. Test with a small dataset first

### Modifying Business Rules
1. Update product classifications and pricing
2. Modify chart of accounts structure
3. Adjust user roles and permissions

### Localization
- Client names are in Arabic as per your Excel
- Currency is set to EGP (Egyptian Pound)
- Language is set to Arabic (ar)

## 🎯 Next Steps

After running the seed file:

1. **Start your application**: `npm run start:dev`
2. **Login**: Use any of the provided credentials
3. **Explore**: Navigate through the different modules
4. **AI Agent**: Test natural language queries with your business data
5. **Reports**: Generate financial and inventory reports

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your PostgreSQL installation and configuration
3. Ensure all dependencies are installed
4. Review the application logs for detailed error messages 