# Sales Module

The Sales module provides comprehensive sales and invoicing functionality including invoice creation, payment processing, and sales reporting.

## Features

- **Invoice Management**: Create, read, update, and delete invoices
- **Payment Processing**: Record payments with multiple payment methods
- **Payment Status Tracking**: Automatic status updates (PENDING, PARTIAL, PAID, OVERDUE, CANCELLED)
- **Sales Analytics**: Comprehensive reporting and analytics
- **Client Management**: Track invoices by client
- **Payment Methods**: Support for multiple payment methods (CASH, CARD, BANK_TRANSFER, CHECK, DIGITAL_WALLET)
- **Overdue Tracking**: Automatic detection and management of overdue invoices

## Entities

### Invoice Entity
- `id`: Unique identifier (UUID)
- `invoiceNumber`: Unique invoice number (auto-generated)
- `clientId`: Reference to client (UUID)
- `subtotal`: Subtotal before tax and discounts (decimal)
- `taxRate`: Tax rate percentage (decimal)
- `taxAmount`: Calculated tax amount (decimal)
- `discountAmount`: Discount amount (decimal)
- `totalAmount`: Final total amount (decimal)
- `paidAmount`: Total amount paid (decimal)
- `remainingAmount`: Outstanding balance (decimal)
- `paymentStatus`: Payment status enum
- `issueDate`: Invoice issue date
- `dueDate`: Payment due date
- `notes`: Additional notes (optional)
- `createdBy`: User who created the invoice (UUID)
- `createdByName`: Username (string)

### InvoiceItem Entity
- `id`: Unique identifier (UUID)
- `invoiceId`: Reference to invoice (UUID)
- `productId`: Reference to product (UUID)
- `productName`: Product name (string)
- `productSku`: Product SKU (string)
- `quantity`: Quantity ordered (integer)
- `unitPrice`: Unit price (decimal)
- `discount`: Item discount (decimal)
- `totalPrice`: Total price for item (decimal)

### Payment Entity
- `id`: Unique identifier (UUID)
- `invoiceId`: Reference to invoice (UUID)
- `amount`: Payment amount (decimal)
- `method`: Payment method enum
- `reference`: Payment reference (optional)
- `notes`: Payment notes (optional)
- `processedBy`: User who processed payment (UUID)
- `processedByName`: Username (string)
- `processedAt`: Payment processing timestamp
- `createdAt`: Payment creation timestamp

## API Endpoints

### Invoice Management

#### Admin, Cashier & Accountant Access
- `POST /sales/invoices` - Create a new invoice
- `PUT /sales/invoices/:id` - Update invoice
- `DELETE /sales/invoices/:id` - Delete invoice

#### All Authenticated Users
- `GET /sales/invoices` - Get all invoices (Admin/Accountant)
- `GET /sales/invoices/:id` - Get invoice by ID
- `GET /sales/invoices/number/:invoiceNumber` - Get invoice by number
- `GET /sales/invoices/client/:clientId` - Get invoices by client (Admin/Accountant)
- `GET /sales/invoices/status/:status` - Get invoices by status (Admin/Accountant)

### Payment Management

#### Admin, Cashier & Accountant Access
- `POST /sales/payments` - Create a new payment
- `GET /sales/payments/invoice/:invoiceId` - Get payments for invoice

### Reports & Analytics

#### Admin & Accountant Access
- `GET /sales/reports/sales` - Sales report with date filtering
- `GET /sales/reports/overdue` - Overdue invoices report
- `GET /sales/reports/dashboard` - Dashboard statistics

### Search & Filtering

#### All Authenticated Users
- `GET /sales/search/invoices` - Search invoices with filters
- `GET /sales/analytics/top-products` - Top selling products
- `GET /sales/analytics/sales-trend` - Sales trend analysis
- `GET /sales/analytics/payment-methods` - Payment method statistics
- `GET /sales/analytics/client-performance` - Client performance analysis

### Utility Endpoints

#### Admin, Cashier & Accountant Access
- `GET /sales/next-invoice-number` - Get next available invoice number
- `POST /sales/invoices/:id/cancel` - Cancel invoice (Admin/Accountant)
- `POST /sales/invoices/:id/mark-overdue` - Mark invoice as overdue (Admin/Accountant)

## DTOs

### CreateInvoiceDto
```typescript
{
  clientId: string;           // Required, valid UUID
  items: InvoiceItemDto[];    // Required, array of items
  taxRate?: number;           // Optional, percentage
  discountAmount?: number;    // Optional, amount
  dueDate?: string;           // Optional, ISO date string
  notes?: string;             // Optional
}

InvoiceItemDto {
  productId: string;          // Required, valid UUID
  quantity: number;           // Required, positive
  unitPrice: number;          // Required, positive
  discount?: number;          // Optional, non-negative
}
```

### CreatePaymentDto
```typescript
{
  invoiceId: string;          // Required, valid UUID
  amount: number;             // Required, positive
  method: PaymentMethod;      // Required, enum
  reference?: string;         // Optional, max 100 chars
  notes?: string;             // Optional
}
```

## Payment Status Flow

1. **PENDING**: Invoice created, no payments made
2. **PARTIAL**: Some payments made, balance remaining
3. **PAID**: Full payment received
4. **OVERDUE**: Payment due date passed, balance outstanding
5. **CANCELLED**: Invoice cancelled (cannot be modified)

## Payment Methods

- **CASH**: Cash payment
- **CARD**: Credit/Debit card payment
- **BANK_TRANSFER**: Bank transfer payment
- **CHECK**: Check payment
- **DIGITAL_WALLET**: Digital wallet payment (PayPal, etc.)

## Usage Examples

### Creating an Invoice
```bash
POST /sales/invoices
Authorization: Bearer <cashier-token>
Content-Type: application/json

{
  "clientId": "client-uuid",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2,
      "unitPrice": 50.00,
      "discount": 5.00
    }
  ],
  "taxRate": 10.0,
  "discountAmount": 10.00,
  "dueDate": "2024-02-15",
  "notes": "Rush order"
}
```

### Recording a Payment
```bash
POST /sales/payments
Authorization: Bearer <cashier-token>
Content-Type: application/json

{
  "invoiceId": "invoice-uuid",
  "amount": 100.00,
  "method": "CARD",
  "reference": "TXN-12345",
  "notes": "Credit card payment"
}
```

### Getting Sales Report
```bash
GET /sales/reports/sales?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <admin-token>
```

### Searching Invoices
```bash
GET /sales/search/invoices?clientId=client-uuid&status=PENDING&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <accountant-token>
```

## Business Logic

### Invoice Creation
- Automatic invoice number generation (INV-YYYY-NNNN format)
- Automatic calculation of subtotal, tax, and total amounts
- Default due date is 30 days from issue date
- Initial payment status is PENDING

### Payment Processing
- Validates payment amount against remaining balance
- Updates invoice payment status automatically
- Records payment with user audit trail
- Prevents overpayment

### Status Management
- Automatic status updates based on payments
- Overdue detection based on due date
- Status restrictions for modifications

### Reporting
- Comprehensive sales analytics
- Top product analysis
- Client performance tracking
- Payment method statistics
- Sales trend analysis

## Error Handling

The module handles various error scenarios:
- `NotFoundException`: Invoice or payment not found
- `BadRequestException`: Invalid payment amount, paid invoice modification
- `ConflictException`: Duplicate invoice number
- `UnauthorizedException`: Invalid or missing authentication
- `ForbiddenException`: Insufficient permissions

## Integration

### With Inventory Module
- Invoice items reference products from inventory
- Stock adjustments should be made when invoices are created/updated
- Product information is copied to invoice items for historical accuracy

### With Clients Module
- Invoices reference clients from the clients module
- Client information is used for invoice generation and reporting

### With Users Module
- User audit trail for invoice creation and payment processing
- Role-based access control for different operations

## Testing

Run the tests with:
```bash
npm run test src/sales
```

The module includes comprehensive unit tests for both the service and controller layers, covering all business logic and edge cases.

## Future Enhancements

- **Email Integration**: Automatic invoice and payment receipt emails
- **PDF Generation**: Invoice PDF generation
- **Recurring Invoices**: Support for recurring billing
- **Discount Rules**: Configurable discount rules and promotions
- **Multi-currency**: Support for multiple currencies
- **Tax Rules**: Configurable tax rules and rates
- **Payment Gateway Integration**: Direct payment processing 