# Clients Module

The Clients module provides comprehensive customer relationship management (CRM) functionality including client registration, tagging, transaction tracking, and customer data management.

## Features

- **Client Management**: Full CRUD operations for customer records
- **Client Tagging**: Flexible tagging system for customer categorization
- **Transaction History**: Track customer purchase and payment history
- **Search & Filtering**: Find clients by tags and other criteria
- **Data Validation**: Comprehensive input validation and error handling
- **Audit Trail**: Automatic creation and update timestamps
- **Email Uniqueness**: Ensures unique email addresses per client
- **Flexible Data Structure**: JSON-based transaction storage

## Entities

### Client Entity
- `id`: Unique identifier (UUID)
- `name`: Client's full name (string, 2-255 characters)
- `email`: Unique email address (string, validated format)
- `phone`: Contact phone number (string, 10-20 characters)
- `tags`: Array of client tags for categorization (string array)
- `transactions`: Array of transaction history (JSON array)
- `createdAt`: Record creation timestamp (datetime)
- `updatedAt`: Last update timestamp (datetime)

### Transaction Interface
- `id`: Transaction identifier (string)
- `amount`: Transaction amount (number)
- `description`: Transaction description (string)
- `date`: Transaction date (datetime)
- `type`: Transaction type - 'purchase', 'refund', or 'credit' (enum)

## API Endpoints

### Client Management
- `POST /clients` - Create a new client
- `GET /clients` - Get all clients
- `GET /clients/:id` - Get client by ID
- `PATCH /clients/:id` - Update client information
- `DELETE /clients/:id` - Delete client

### Client Tagging
- `POST /clients/:id/tags` - Add tags to client
- `DELETE /clients/:id/tags` - Remove tags from client
- `GET /clients/tag/:tag` - Find clients by tag

### Transaction Management
- `POST /clients/:id/transactions` - Add transaction to client
- `GET /clients/:id/transactions` - Get client transaction history

## DTOs

### CreateClientDto
```typescript
{
  name: string;     // Required, 2-255 characters
  email: string;    // Required, valid email format, unique
  phone: string;    // Required, 10-20 characters
}
```

### UpdateClientDto
```typescript
{
  name?: string;    // Optional, 2-255 characters
  email?: string;   // Optional, valid email format, unique
  phone?: string;   // Optional, 10-20 characters
}
```

### TagClientDto
```typescript
{
  tags: string[];   // Required, array of tag strings, minimum 1 tag
}
```

## Usage Examples

### Create a New Client
```bash
POST /clients
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "id": "client-uuid-1",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "tags": [],
  "transactions": [],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Get All Clients
```bash
GET /clients
```

**Response:**
```json
[
  {
    "id": "client-uuid-1",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "tags": ["vip", "regular"],
    "transactions": [],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

### Get Client by ID
```bash
GET /clients/client-uuid-1
```

**Response:**
```json
{
  "id": "client-uuid-1",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "tags": ["vip", "regular"],
  "transactions": [],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Update Client Information
```bash
PATCH /clients/client-uuid-1
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "+1987654321"
}
```

**Response:**
```json
{
  "id": "client-uuid-1",
  "name": "John Smith",
  "email": "john.doe@example.com",
  "phone": "+1987654321",
  "tags": ["vip", "regular"],
  "transactions": [],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T11:45:00Z"
}
```

### Add Tags to Client
```bash
POST /clients/client-uuid-1/tags
Content-Type: application/json

{
  "tags": ["premium", "wholesale"]
}
```

**Response:**
```json
{
  "id": "client-uuid-1",
  "name": "John Smith",
  "email": "john.doe@example.com",
  "phone": "+1987654321",
  "tags": ["vip", "regular", "premium", "wholesale"],
  "transactions": [],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

### Remove Tags from Client
```bash
DELETE /clients/client-uuid-1/tags
Content-Type: application/json

{
  "tags": ["regular"]
}
```

**Response:**
```json
{
  "id": "client-uuid-1",
  "name": "John Smith",
  "email": "john.doe@example.com",
  "phone": "+1987654321",
  "tags": ["vip", "premium", "wholesale"],
  "transactions": [],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T12:15:00Z"
}
```

### Add Transaction to Client
```bash
POST /clients/client-uuid-1/transactions
Content-Type: application/json

{
  "id": "txn-001",
  "amount": 150.00,
  "description": "Purchase of electronics",
  "date": "2024-01-15T12:30:00Z",
  "type": "purchase"
}
```

**Response:**
```json
{
  "id": "client-uuid-1",
  "name": "John Smith",
  "email": "john.doe@example.com",
  "phone": "+1987654321",
  "tags": ["vip", "premium", "wholesale"],
  "transactions": [
    {
      "id": "txn-001",
      "amount": 150.00,
      "description": "Purchase of electronics",
      "date": "2024-01-15T12:30:00Z",
      "type": "purchase"
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T12:30:00Z"
}
```

### Get Client Transaction History
```bash
GET /clients/client-uuid-1/transactions
```

**Response:**
```json
[
  {
    "id": "txn-002",
    "amount": 75.50,
    "description": "Refund for damaged item",
    "date": "2024-01-16T09:15:00Z",
    "type": "refund"
  },
  {
    "id": "txn-001",
    "amount": 150.00,
    "description": "Purchase of electronics",
    "date": "2024-01-15T12:30:00Z",
    "type": "purchase"
  }
]
```

### Find Clients by Tag
```bash
GET /clients/tag/vip
```

**Response:**
```json
[
  {
    "id": "client-uuid-1",
    "name": "John Smith",
    "email": "john.doe@example.com",
    "phone": "+1987654321",
    "tags": ["vip", "premium", "wholesale"],
    "transactions": [],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T12:30:00Z"
  },
  {
    "id": "client-uuid-2",
    "name": "Jane Wilson",
    "email": "jane.wilson@example.com",
    "phone": "+1555123456",
    "tags": ["vip", "loyal"],
    "transactions": [],
    "createdAt": "2024-01-14T08:20:00Z",
    "updatedAt": "2024-01-14T08:20:00Z"
  }
]
```

### Delete Client
```bash
DELETE /clients/client-uuid-1
```

**Response:** `204 No Content`

## Business Logic

### Client Creation
- Validates email uniqueness before creation
- Applies input validation rules
- Generates unique UUID identifier
- Sets initial empty tags and transactions arrays
- Records creation timestamp

### Client Updates
- Validates email uniqueness if email is being changed
- Allows partial updates (only provided fields)
- Updates the `updatedAt` timestamp
- Preserves existing data for unchanged fields

### Tag Management
- **Adding Tags**: Merges new tags with existing ones, removes duplicates
- **Removing Tags**: Filters out specified tags from the array
- **Tag Search**: Uses SQL LIKE query for partial tag matching

### Transaction Management
- **Adding Transactions**: Appends new transaction to existing array
- **Transaction History**: Returns sorted transactions (newest first)
- **Transaction Types**: Supports purchase, refund, and credit types

### Data Validation
- **Name**: 2-255 characters, required
- **Email**: Valid email format, unique, required
- **Phone**: 10-20 characters, required
- **Tags**: Array of strings, minimum 1 tag when adding

## Error Handling

The module handles various error scenarios:
- `NotFoundException`: Client not found
- `ConflictException`: Email already exists
- `BadRequestException`: Invalid input data
- `ValidationError`: DTO validation failures

### Common Error Responses

#### Client Not Found
```json
{
  "statusCode": 404,
  "message": "Client with ID client-uuid-1 not found",
  "error": "Not Found"
}
```

#### Email Already Exists
```json
{
  "statusCode": 409,
  "message": "Client with this email already exists",
  "error": "Conflict"
}
```

#### Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "name must be longer than or equal to 2 characters",
    "email must be an email"
  ],
  "error": "Bad Request"
}
```

## Integration

### With Other Modules
- **Sales Module**: Links clients to invoices and sales transactions
- **Auth Module**: Role-based access control for client operations
- **Users Module**: User management for client operations
- **Reports Module**: Client analytics and reporting

### Database Schema
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  transactions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing

Run the tests with:
```bash
npm run test src/clients
```

The module includes comprehensive unit tests covering:
- Client CRUD operations
- Tag management functionality
- Transaction handling
- Error scenarios
- Data validation
- Edge cases

## Performance Considerations

### Database Optimization
- **Indexes**: Email field indexed for uniqueness and fast lookups
- **JSON Storage**: Transactions stored as JSON for flexibility
- **Array Storage**: Tags stored as PostgreSQL arrays for efficient querying
- **UUID Primary Keys**: Distributed ID generation

### Query Optimization
- **Tag Search**: Uses database-level LIKE queries
- **Transaction Sorting**: Client-side sorting for small datasets
- **Lazy Loading**: Transactions loaded only when needed

## Security Features

### Data Protection
- **Input Validation**: Comprehensive DTO validation
- **SQL Injection Prevention**: Parameterized queries via TypeORM
- **Email Uniqueness**: Database-level uniqueness constraints
- **Data Sanitization**: Automatic input sanitization

### Access Control
- **Role-Based Access**: Integration with auth module
- **Audit Trail**: Automatic timestamp tracking
- **Data Integrity**: Foreign key constraints and validations

## Best Practices

### Client Management
- Use descriptive tags for easy categorization
- Maintain consistent phone number formats
- Regular data validation and cleanup
- Implement client archiving for inactive clients

### Transaction Tracking
- Use descriptive transaction descriptions
- Maintain consistent transaction types
- Regular transaction history cleanup
- Implement transaction reconciliation

### Tag Strategy
- Use standardized tag naming conventions
- Implement tag hierarchy for complex categorization
- Regular tag cleanup and consolidation
- Document tag meanings and usage

## Future Enhancements

- **Client Segmentation**: Advanced client categorization
- **Communication History**: Email and call tracking
- **Client Notes**: Rich text notes and comments
- **Client Preferences**: Product and service preferences
- **Client Scoring**: Automated client value scoring
- **Bulk Operations**: Import/export client data
- **Client Analytics**: Advanced reporting and insights
- **Integration APIs**: Third-party CRM integrations
- **Client Portal**: Self-service client portal
- **Automated Tagging**: AI-powered client categorization 