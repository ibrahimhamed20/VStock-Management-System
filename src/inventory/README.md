# Inventory Module

The Inventory module provides comprehensive product and inventory management functionality including product CRUD operations, stock tracking, batch management, and ABC classification.

## Features

- **Product Management**: Create, read, update, and delete products
- **Stock Tracking**: Real-time stock level monitoring and adjustments
- **Batch Management**: Track product batches with expiry dates
- **ABC Classification**: Automatic classification based on product value
- **Stock Movements**: Complete audit trail of all stock changes
- **Low Stock Alerts**: Automatic detection of products below minimum stock
- **Expiry Tracking**: Monitor batch expiry dates
- **Inventory Reports**: Comprehensive reporting and analytics

## Entities

### Product Entity
- `id`: Unique identifier (UUID)
- `sku`: Unique stock keeping unit (50 characters max)
- `name`: Product name (255 characters max)
- `description`: Product description (optional)
- `unitCost`: Cost per unit (decimal)
- `sellingPrice`: Selling price per unit (decimal)
- `stock`: Current stock level (integer)
- `minStock`: Minimum stock threshold (integer)
- `maxStock`: Maximum stock threshold (integer)
- `classification`: ABC classification (A, B, C)
- `category`: Product category (optional)
- `supplier`: Supplier name (optional)
- `isActive`: Product status (boolean)

### Batch Entity
- `id`: Unique identifier (UUID)
- `batchId`: Unique batch identifier (100 characters max)
- `productId`: Reference to product (UUID)
- `expiryDate`: Batch expiry date
- `quantity`: Total batch quantity
- `remainingQuantity`: Remaining quantity in batch
- `manufacturingDate`: Manufacturing date (optional)
- `supplier`: Batch supplier (optional)
- `cost`: Batch cost per unit (decimal)

### StockMovement Entity
- `id`: Unique identifier (UUID)
- `productId`: Reference to product (UUID)
- `type`: Movement type (PURCHASE, SALE, ADJUSTMENT, RETURN, TRANSFER)
- `quantity`: Quantity moved (positive for IN, negative for OUT)
- `unitPrice`: Unit price at time of movement (optional)
- `totalValue`: Total value of movement (optional)
- `reason`: Reason for movement (optional)
- `reference`: Reference number/document (optional)
- `batchId`: Associated batch ID (optional)
- `userId`: User who made the movement (optional)
- `userName`: Username (optional)
- `createdAt`: Movement timestamp

## API Endpoints

### Product Management

#### Admin & Accountant Access
- `POST /inventory/products` - Create a new product
- `PUT /inventory/products/:id` - Update product
- `DELETE /inventory/products/:id` - Delete product

#### All Authenticated Users
- `GET /inventory/products` - Get all products
- `GET /inventory/products/:id` - Get product by ID
- `GET /inventory/products/sku/:sku` - Get product by SKU

### Stock Management

#### Admin, Accountant & Cashier Access
- `POST /inventory/stock/adjust` - Adjust stock levels

#### Admin & Accountant Access
- `GET /inventory/stock/low-stock` - Get low stock products
- `GET /inventory/stock/movements` - Get stock movement history

### Batch Management

#### Admin & Accountant Access
- `POST /inventory/batches` - Create a new batch
- `GET /inventory/batches/product/:productId` - Get batches for product
- `GET /inventory/batches/expiring` - Get expiring batches

### Reports & Analytics

#### Admin & Accountant Access
- `GET /inventory/reports/abc-classification` - ABC classification report
- `GET /inventory/reports/stock-value` - Stock value report
- `GET /inventory/reports/stock-alerts` - Stock alerts report

### Search & Filtering

#### All Authenticated Users
- `GET /inventory/search` - Search products with filters
- `GET /inventory/categories` - Get all product categories
- `GET /inventory/suppliers` - Get all suppliers

## DTOs

### CreateProductDto
```typescript
{
  sku: string;           // Required, max 50 chars
  name: string;          // Required, max 255 chars
  description?: string;  // Optional
  unitCost: number;      // Required, positive
  sellingPrice: number;  // Required, positive
  stock: number;         // Required, non-negative
  minStock: number;      // Required, non-negative
  maxStock: number;      // Required, non-negative
  category?: string;     // Optional, max 100 chars
  supplier?: string;     // Optional, max 255 chars
}
```

### UpdateProductDto
```typescript
{
  name?: string;         // Optional, max 255 chars
  description?: string;  // Optional
  unitCost?: number;     // Optional, positive
  sellingPrice?: number; // Optional, positive
  minStock?: number;     // Optional, non-negative
  maxStock?: number;     // Optional, non-negative
  category?: string;     // Optional, max 100 chars
  supplier?: string;     // Optional, max 255 chars
  isActive?: boolean;    // Optional
}
```

### StockAdjustmentDto
```typescript
{
  productId: string;     // Required, valid UUID
  quantity: number;      // Required
  reason: string;        // Required, max 255 chars
  type: 'IN' | 'OUT';    // Required
  reference?: string;    // Optional, max 100 chars
  batchId?: string;      // Optional, max 100 chars
}
```

### CreateBatchDto
```typescript
{
  batchId: string;       // Required, max 100 chars
  productId: string;     // Required, valid UUID
  expiryDate: string;    // Required, ISO date string
  quantity: number;      // Required, positive
  manufacturingDate?: string; // Optional, ISO date string
  supplier?: string;     // Optional, max 255 chars
  cost: number;          // Required, positive
}
```

## ABC Classification

The system automatically classifies products based on their total value (unit cost × stock):

- **Class A**: High value items (≥ $10,000 total value)
- **Class B**: Medium value items ($1,000 - $9,999 total value)
- **Class C**: Low value items (< $1,000 total value)

## Usage Examples

### Creating a Product
```bash
POST /inventory/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "sku": "LAPTOP001",
  "name": "Dell Latitude Laptop",
  "description": "15-inch business laptop",
  "unitCost": 800.00,
  "sellingPrice": 1200.00,
  "stock": 50,
  "minStock": 10,
  "maxStock": 100,
  "category": "Electronics",
  "supplier": "Dell Inc."
}
```

### Adjusting Stock
```bash
POST /inventory/stock/adjust
Authorization: Bearer <cashier-token>
Content-Type: application/json

{
  "productId": "product-uuid",
  "quantity": 5,
  "reason": "Sale transaction",
  "type": "OUT",
  "reference": "SALE-2024-001"
}
```

### Creating a Batch
```bash
POST /inventory/batches
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "batchId": "BATCH-2024-001",
  "productId": "product-uuid",
  "expiryDate": "2024-12-31",
  "quantity": 100,
  "manufacturingDate": "2024-01-01",
  "supplier": "PharmaCorp",
  "cost": 5.50
}
```

### Getting ABC Classification Report
```bash
GET /inventory/reports/abc-classification
Authorization: Bearer <admin-token>
```

### Searching Products
```bash
GET /inventory/search?q=laptop&category=Electronics&classification=A
Authorization: Bearer <user-token>
```

## Error Handling

The module handles various error scenarios:
- `NotFoundException`: Product or batch not found
- `ConflictException`: SKU or batch ID already exists
- `BadRequestException`: Invalid stock adjustment or insufficient stock
- `UnauthorizedException`: Invalid or missing authentication
- `ForbiddenException`: Insufficient permissions

## Business Logic

### Stock Management
- Stock adjustments automatically update product stock levels
- ABC classification is recalculated after stock changes
- Stock movements are recorded for audit trail
- Low stock alerts are generated automatically

### Batch Management
- Batches track expiry dates for perishable items
- Remaining quantity is tracked separately from total quantity
- Expiry alerts are generated for batches expiring soon

### ABC Classification
- Automatic classification based on total inventory value
- Helps prioritize inventory management efforts
- Class A items require more frequent monitoring
- Class C items can be managed with less attention

## Testing

Run the tests with:
```bash
npm run test src/inventory
```

The module includes comprehensive unit tests for both the service and controller layers, covering all business logic and edge cases. 