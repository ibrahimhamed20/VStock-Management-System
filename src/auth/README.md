# Authentication Module

The Authentication module provides comprehensive user authentication, authorization, and security features including JWT-based authentication, role-based access control, password management, and audit logging.

## Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions based on user roles
- **Password Security**: Bcrypt hashing and password reset functionality
- **Audit Logging**: Comprehensive security event tracking
- **Public Endpoints**: Configurable public access for specific routes
- **IP Tracking**: Client IP address and user agent logging
- **Token Management**: JWT token generation and validation
- **Security Guards**: Route protection and authorization middleware

## User Roles

### Admin
- Full system access
- User management
- Audit log access
- All module operations

### Accountant
- Financial operations
- Reports and analytics
- Purchase and sales management
- Limited user operations

### Cashier
- Sales operations
- Payment processing
- Basic inventory access
- Limited reporting

## Entities

### AuditLog Entity
- `id`: Unique identifier (UUID)
- `userId`: User who performed the action (UUID)
- `username`: Username for reference (string)
- `role`: User role at time of action (enum)
- `action`: Type of action performed (string)
- `details`: Additional action details (text, optional)
- `ipAddress`: Client IP address (string, optional)
- `userAgent`: Client user agent (string, optional)
- `timestamp`: Action timestamp (datetime)

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/password-reset-request` - Request password reset
- `POST /auth/password-reset` - Reset password with token

### Protected Endpoints (Authentication Required)

#### User Management
- `GET /auth/profile` - Get current user profile

#### Admin Only
- `GET /auth/audit-logs` - Get audit logs (with optional filtering)

## DTOs

### LoginDto
```typescript
{
  username: string;     // Required, user's username
  password: string;     // Required, user's password
}
```

### RegisterDto
```typescript
{
  username: string;     // Required, unique username
  email: string;        // Required, valid email format
  password: string;     // Required, minimum 6 characters
  role: UserRole;       // Required, valid user role
}
```

### PasswordResetRequestDto
```typescript
{
  email: string;        // Required, valid email format
}
```

### PasswordResetDto
```typescript
{
  token: string;        // Required, reset token
  newPassword: string;  // Required, minimum 6 characters
}
```

## Guards and Decorators

### JWT Authentication Guard
- Validates JWT tokens on protected routes
- Extracts user information from token
- Handles token expiration and validation

### Roles Guard
- Enforces role-based access control
- Validates user permissions for specific routes
- Works with `@Roles()` decorator

### Public Decorator
- Marks routes as publicly accessible
- Bypasses authentication requirements
- Used for login, register, and password reset endpoints

### Roles Decorator
- Specifies required roles for route access
- Supports multiple roles (OR logic)
- Example: `@Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)`

## Usage Examples

### User Login
```bash
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### User Registration
```bash
POST /auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securepassword123",
  "role": "cashier"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "2",
    "username": "newuser",
    "email": "user@example.com",
    "role": "cashier"
  }
}
```

### Request Password Reset
```bash
POST /auth/password-reset-request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If the email exists, a password reset link has been sent."
}
```

### Reset Password
```bash
POST /auth/password-reset
Content-Type: application/json

{
  "token": "reset-token-here",
  "newPassword": "newsecurepassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

### Get User Profile (Authenticated)
```bash
GET /auth/profile
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "userId": "1",
  "username": "admin",
  "role": "admin"
}
```

### Get Audit Logs (Admin Only)
```bash
GET /auth/audit-logs?userId=1&limit=50
Authorization: Bearer <admin-token>
```

**Response:**
```json
[
  {
    "id": "log-1",
    "userId": "1",
    "username": "admin",
    "role": "admin",
    "action": "LOGIN",
    "details": "User logged in successfully",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

## Security Features

### JWT Token Security
- **Secret Key**: Environment-based secret key
- **Expiration**: Configurable token expiration time
- **Algorithm**: HS256 signing algorithm
- **Payload**: Minimal user information (userId, username, role)

### Password Security
- **Hashing**: Bcrypt with salt rounds (10)
- **Validation**: Minimum 6 characters required
- **Reset Process**: Secure token-based password reset

### Audit Logging
- **Comprehensive Tracking**: All authentication events logged
- **IP Tracking**: Client IP address recording
- **User Agent**: Browser/client information
- **Timestamp**: Precise event timing
- **Action Details**: Descriptive action information

### Role-Based Access Control
- **Granular Permissions**: Route-level access control
- **Role Validation**: Server-side role verification
- **Flexible Configuration**: Easy role assignment and modification

## Authentication Flow

### Login Process
1. **Request**: Client sends username/password
2. **Validation**: Server validates credentials
3. **Password Check**: Bcrypt comparison
4. **Token Generation**: JWT token creation
5. **Audit Log**: Login event recorded
6. **Response**: Token and user info returned

### Registration Process
1. **Request**: Client sends registration data
2. **Validation**: Data validation and duplicate checking
3. **Password Hashing**: Bcrypt password hashing
4. **User Creation**: New user record creation
5. **Audit Log**: Registration event recorded
6. **Response**: Success message and user info

### Password Reset Process
1. **Request**: Client requests password reset
2. **Email Validation**: Email existence verification
3. **Token Generation**: Secure reset token creation
4. **Email Sending**: Reset link sent to email
5. **Audit Log**: Reset request recorded
6. **Token Validation**: Client submits token and new password
7. **Password Update**: New password hashed and stored
8. **Audit Log**: Reset completion recorded

## Integration

### With Other Modules
- **Users Module**: User management integration
- **All Protected Modules**: Authentication and authorization
- **Role-Based Routes**: Granular access control

### Environment Configuration
```env
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1h
```

### Module Dependencies
- **@nestjs/jwt**: JWT token handling
- **@nestjs/config**: Configuration management
- **bcrypt**: Password hashing
- **typeorm**: Database operations

## Error Handling

The module handles various error scenarios:
- `UnauthorizedException`: Invalid credentials
- `ConflictException`: Duplicate user registration
- `NotFoundException`: User not found
- `BadRequestException`: Invalid input data
- `ForbiddenException`: Insufficient permissions

## Testing

Run the tests with:
```bash
npm run test src/auth
```

The module includes comprehensive unit tests covering:
- Authentication flows
- Password security
- JWT token handling
- Role-based access control
- Audit logging
- Error scenarios

## Security Best Practices

### Token Management
- Store tokens securely (HttpOnly cookies recommended)
- Implement token refresh mechanism
- Set appropriate expiration times
- Validate tokens on every request

### Password Security
- Use strong password policies
- Implement rate limiting on login attempts
- Regular password expiration
- Multi-factor authentication (future enhancement)

### Audit Logging
- Monitor for suspicious activities
- Regular log analysis
- Secure log storage
- Compliance with data protection regulations

## Future Enhancements

- **Multi-Factor Authentication**: SMS/Email verification
- **OAuth Integration**: Social login providers
- **Session Management**: Active session tracking
- **Account Lockout**: Brute force protection
- **Email Verification**: Account activation emails
- **Token Refresh**: Automatic token renewal
- **Password Policies**: Configurable password rules
- **Login History**: User login tracking
- **Device Management**: Trusted device management
- **API Rate Limiting**: Request throttling 