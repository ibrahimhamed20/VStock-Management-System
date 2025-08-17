# Users Module

The Users module provides comprehensive user management functionality including CRUD operations, role assignment, and login history tracking.

## Features

- **User Management**: Create, read, update, and delete users
- **Role Assignment**: Assign different roles to users (ADMIN, CASHIER, ACCOUNTANT)
- **Login History**: Track user login activity with timestamps and metadata
- **Profile Management**: Users can view and update their own profiles
- **Authorization**: Role-based access control for all endpoints

## Entities

### User Entity
- `id`: Unique identifier (UUID)
- `username`: Unique username (3-50 characters)
- `email`: Unique email address
- `role`: User role (ADMIN, CASHIER, ACCOUNTANT)
- `lastLogin`: Timestamp of last login
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

### UserLoginHistory Entity
- `id`: Unique identifier (UUID)
- `userId`: Reference to user
- `ipAddress`: IP address of login (optional)
- `userAgent`: Browser/user agent (optional)
- `loginAt`: Login timestamp

## API Endpoints

### Admin Only Endpoints (Require ADMIN role)

#### User Management
- `POST /users` - Create a new user
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `GET /users/username/:username` - Get user by username
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Role Management
- `POST /users/assign-role` - Assign role to user
- `GET /users/by-role/:role` - Get users by role

#### Login History
- `GET /users/:id/login-history` - Get user login history

### User Endpoints (Available to all authenticated users)

#### Profile Management
- `GET /users/profile/me` - Get current user profile
- `PUT /users/profile/me` - Update current user profile

#### Login Tracking
- `POST /users/record-login` - Record login activity

## DTOs

### CreateUserDto
```typescript
{
  username: string; // 3-50 characters
  email: string;    // Valid email format
  role: UserRole;   // ADMIN, CASHIER, or ACCOUNTANT
}
```

### UpdateUserDto
```typescript
{
  email?: string;   // Optional valid email
  role?: UserRole;  // Optional role
}
```

### AssignRoleDto
```typescript
{
  userId: string;   // Valid UUID
  role: UserRole;   // ADMIN, CASHIER, or ACCOUNTANT
}
```

## Usage Examples

### Creating a User
```bash
POST /users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "role": "cashier"
}
```

### Assigning a Role
```bash
POST /users/assign-role
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "userId": "user-uuid",
  "role": "admin"
}
```

### Getting Login History
```bash
GET /users/user-uuid/login-history
Authorization: Bearer <admin-token>
```

### Updating Own Profile
```bash
PUT /users/profile/me
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "email": "updated@example.com"
}
```

## Error Handling

The module handles various error scenarios:
- `NotFoundException`: User not found
- `ConflictException`: Username or email already exists
- `UnauthorizedException`: Invalid or missing authentication
- `ForbiddenException`: Insufficient permissions

## Testing

Run the tests with:
```bash
npm run test src/users
```

The module includes comprehensive unit tests for both the service and controller layers. 