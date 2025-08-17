# Purchasing Module

The Purchasing module provides comprehensive procurement management functionality including purchase order creation, supplier management, goods receiving, and purchasing analytics.

## Features

- **Purchase Order Management**: Create, read, update, and delete purchase orders
- **Supplier Management**: Complete supplier lifecycle management
- **Purchase Status Tracking**: Automatic status updates (DRAFT, PENDING, APPROVED, ORDERED, RECEIVED, CANCELLED)
- **Payment Status Tracking**: Track payment status (PENDING, PARTIAL, PAID, OVERDUE)
- **Goods Receiving**: Support for partial and complete receiving
- **Purchase Analytics**: Comprehensive reporting and analytics
- **Supplier Performance**: Track supplier performance and reliability
- **Overdue Tracking**: Automatic detection and management of overdue purchases

## Entities

### Purchase Entity
- `id`: Unique identifier (UUID)
- `purchaseNumber`: Unique purchase number (auto-generated)
- `supplierId`: Reference to supplier (UUID)
- `subtotal`: Subtotal before tax and shipping (decimal)
- `taxRate`: Tax rate percentage (decimal)
- `taxAmount`: Calculated tax amount (decimal)
- `shippingCost`: Shipping cost (decimal)
- `totalAmount`: Final total amount (decimal)
- `paidAmount`: Total amount paid (decimal)
- `remainingAmount`: Outstanding balance (decimal)
- `purchaseStatus`: Purchase status enum
- `paymentStatus`: Payment status enum
- `orderDate`: Purchase order date
- `expectedDeliveryDate`: Expected delivery date
- `actualDeliveryDate`: Actual delivery date (optional)
- `notes`: Additional notes (optional)
- `createdBy`: User who created the purchase (UUID)
- `createdByName`: Username (string)

### PurchaseItem Entity
- `id`: Unique identifier (UUID)
- `purchaseId`: Reference to purchase (UUID)
- `productId`: Reference to product (UUID)
- `productName`: Product name (string)
- `productSku`: Product SKU (string)
- `quantity`: Quantity ordered (integer)
- `unitCost`: Unit cost (decimal)
- `totalCost`: Total cost for item (decimal)
- `receivedQuantity`: Quantity received (integer)
- `notes`: Item notes (optional)

### Supplier Entity
- `id`: Unique identifier (UUID)
- `name`: Supplier name (unique)
- `email`: Email address (unique)
- `phone`: Phone number (string)
- `address`: Physical address (text)
- `contactPerson`: Primary contact person (string)
- `taxId`: Tax identification number (optional)
- `paymentTerms`: Payment terms in days (integer)
- `isActive`: Active status (boolean)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## API Endpoints

### Purchase Management

#### Admin & Accountant Access
- `POST /purchasing/purchases` - Create a new purchase order
- `PUT /purchasing/purchases/:id` - Update purchase order
- `DELETE /purchasing/purchases/:id` - Delete purchase order
- `POST /purchasing/purchases/:id/receive` - Receive goods

#### All Authenticated Users
- `GET /purchasing/purchases` - Get all purchase orders
- `GET /purchasing/purchases/:id` - Get purchase order by ID
- `GET /purchasing/purchases/number/:purchaseNumber` - Get purchase by number
- `GET /purchasing/purchases/supplier/:supplierId` - Get purchases by supplier
- `GET /purchasing/purchases/status/:status` - Get purchases by status

### Supplier Management

#### Admin & Accountant Access
- `POST /purchasing/suppliers` - Create a new supplier
- `PUT /purchasing/suppliers/:id` - Update supplier
- `DELETE /purchasing/suppliers/:id` - Delete supplier

#### All Authenticated Users
- `GET /purchasing/suppliers` - Get all suppliers
- `GET /purchasing/suppliers/:id` - Get supplier by ID

### Reports & Analytics

#### Admin & Accountant Access
- `GET /purchasing/reports/purchases` - Purchase report with date filtering
- `GET /purchasing/reports/overdue` - Overdue purchases report
- `GET /purchasing/reports/dashboard` - Dashboard statistics

### Search & Filtering

#### All Authenticated Users
- `GET /purchasing/search/purchases` - Search purchases with filters
- `GET /purchasing/analytics/top-suppliers` - Top suppliers analysis
- `GET /purchasing/analytics/purchase-trend` - Purchase trend analysis
- `GET /purchasing/analytics/supplier-performance` - Supplier performance analysis

### Utility Endpoints

#### Admin & Accountant Access
- `GET /purchasing/next-purchase-number` - Get next available purchase number
- `POST /purchasing/purchases/:id/approve` - Approve purchase order
- `POST /purchasing/purchases/:id/order` - Mark purchase as ordered
- `POST /purchasing/purchases/:id/cancel` - Cancel purchase order
- `POST /purchasing/purchases/:id/mark-overdue` - Mark purchase as overdue

## DTOs

### CreatePurchaseDto
```typescript
{
  supplierId: string;           // Required, valid UUID
  items: PurchaseItemDto[];     // Required, array of items
  taxRate?: number;             // Optional, percentage
  shippingCost?: number;        // Optional, amount
  expectedDeliveryDate?: string; // Optional, ISO date string
  notes?: string;               // Optional
}

PurchaseItemDto {
  productId: string;            // Required, valid UUID
  productName?: string;         // Optional
  productSku?: string;          // Optional
  quantity: number;             // Required, positive
  unitCost: number;             // Required, positive
  notes?: string;               // Optional
}
```

### CreateSupplierDto
```typescript
{
  name: string;                 // Required, max 255 chars
  email: string;                // Required, valid email
  phone: string;                // Required, max 20 chars
  address: string;              // Required
  contactPerson: string;        // Required, max 255 chars
  taxId?: string;               // Optional, max 50 chars
  paymentTerms?: number;        // Optional, positive integer
}
```

## Purchase Status Flow

1. **DRAFT**: Purchase order created, not yet submitted
2. **PENDING**: Purchase order submitted, awaiting approval
3. **APPROVED**: Purchase order approved, ready for ordering
4. **ORDERED**: Purchase order sent to supplier
5. **RECEIVED**: Goods received (partial or complete)
6. **CANCELLED**: Purchase order cancelled

## Payment Status Flow

1. **PENDING**: No payments made
2. **PARTIAL**: Some payments made, balance remaining
3. **PAID**: Full payment received
4. **OVERDUE**: Payment due date passed, balance outstanding

## Usage Examples

### Creating a Purchase Order
```bash
POST /purchasing/purchases
Authorization: Bearer <accountant-token>
Content-Type: application/json

{
  "supplierId": "supplier-uuid",
  "items": [
    {
      "productId": "product-uuid",
      "productName": "Laptop",
      "productSku": "LAP-001",
      "quantity": 5,
      "unitCost": 800.00,
      "notes": "High priority order"
    }
  ],
  "taxRate": 10.0,
  "shippingCost": 50.00,
  "expectedDeliveryDate": "2024-02-15",
  "notes": "Rush order for new office setup"
}
```

### Creating a Supplier
```bash
POST /purchasing/suppliers
Authorization: Bearer <accountant-token>
Content-Type: application/json

{
  "name": "Tech Supplies Inc.",
  "email": "orders@techsupplies.com",
  "phone": "+1-555-0123",
  "address": "123 Tech Street, Silicon Valley, CA 94025",
  "contactPerson": "John Smith",
  "taxId": "TAX-123456789",
  "paymentTerms": 30
}
```

### Receiving Goods
```bash
POST /purchasing/purchases/purchase-uuid/receive
Authorization: Bearer <accountant-token>
Content-Type: application/json

{
  "receivedItems": [
    {
      "itemId": "item-uuid",
      "receivedQuantity": 3
    }
  ]
}
```

### Getting Purchase Report
```bash
GET /purchasing/reports/purchases?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <admin-token>
```

### Searching Purchases
```bash
GET /purchasing/search/purchases?supplierId=supplier-uuid&status=ORDERED&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <accountant-token>
```

## Business Logic

### Purchase Order Creation
- Automatic purchase number generation (PO-YYYY-NNNN format)
- Automatic calculation of subtotal, tax, and total amounts
- Default expected delivery date is 14 days from order date
- Initial purchase status is DRAFT
- Initial payment status is PENDING

### Purchase Status Management
- Automatic status validation and transitions
- Status restrictions for modifications
- Receiving process with partial support
- Overdue detection based on expected delivery date

### Supplier Management
- Unique name and email validation
- Payment terms configuration
- Active/inactive status tracking
- Deletion protection for suppliers with purchase history

### Receiving Process
- Support for partial receiving
- Validation of received quantities against ordered quantities
- Automatic status update to RECEIVED when all items received
- Recording of actual delivery date

### Reporting
- Comprehensive purchase analytics
- Top supplier analysis
- Purchase trend analysis
- Supplier performance tracking
- Overdue purchase monitoring

## Error Handling

The module handles various error scenarios:
- `NotFoundException`: Purchase or supplier not found
- `BadRequestException`: Invalid data, status violations, quantity validation
- `ConflictException`: Duplicate supplier name/email
- `UnauthorizedException`: Invalid or missing authentication
- `ForbiddenException`: Insufficient permissions

## Integration

### With Inventory Module
- Purchase items reference products from inventory
- Stock adjustments should be made when goods are received
- Product information is copied to purchase items for historical accuracy

### With Users Module
- User audit trail for purchase creation and receiving
- Role-based access control for different operations

### With Sales Module
- Purchase costs can be used for cost analysis
- Inventory valuation based on purchase costs

## Testing

Run the tests with:
```bash
npm run test src/purchasing
```

The module includes comprehensive unit tests for both the service and controller layers, covering all business logic and edge cases.

## Purchase Workflow Example

1. **Create Purchase Order (DRAFT)**
   ```bash
   POST /purchasing/purchases
   ```

2. **Approve Purchase Order**
   ```bash
   POST /purchasing/purchases/:id/approve
   ```

3. **Mark as Ordered**
   ```bash
   POST /purchasing/purchases/:id/order
   ```

4. **Receive Goods (Partial)**
   ```bash
   POST /purchasing/purchases/:id/receive
   ```

5. **Receive Remaining Goods**
   ```bash
   POST /purchasing/purchases/:id/receive
   ```

6. **Update Payment Status**
   ```bash
   PUT /purchasing/purchases/:id
   {
     "paymentStatus": "PAID"
   }
   ```

## Future Enhancements

- **Email Integration**: Automatic purchase order emails to suppliers
- **PDF Generation**: Purchase order PDF generation
- **Approval Workflow**: Multi-level approval process
- **Cost Analysis**: Detailed cost tracking and analysis
- **Supplier Rating**: Supplier performance rating system
- **Automated Reordering**: Automatic reorder point management
- **Contract Management**: Supplier contract tracking
- **Quality Control**: Quality inspection workflow
- **Return Management**: Return and refund processing
- **Budget Management**: Purchase budget tracking and alerts 