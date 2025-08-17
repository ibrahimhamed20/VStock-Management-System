# Settings Module

The Settings module provides centralized management of system-wide configuration, including currency, language, fiscal year, and tax rate. It exposes endpoints for retrieving and updating settings, ensuring consistent configuration across the application.

## Features

- **Centralized Configuration**: Manage global settings in one place
- **REST API**: Endpoints for getting and updating settings
- **Validation**: Input validation for all fields
- **Auto-Initialization**: Automatically creates a settings record if missing
- **Extensible**: Easily add new settings fields as needed

## Entity

### Settings Entity
- `id`: Unique identifier (UUID)
- `currency`: Currency code (e.g., 'USD', 'EUR')
- `language`: Language code (e.g., 'en', 'fr')
- `fiscalYear`: Fiscal year (string, optional)
- `taxRate`: Tax rate as a percentage (decimal, 0-100)

## DTOs

### UpdateSettingsDto
```typescript
{
  currency?: string;    // Optional, currency code
  language?: string;    // Optional, language code
  fiscalYear?: string;  // Optional, fiscal year
  taxRate?: number;     // Optional, 0-100
}
```

## API Endpoints

### Get Current Settings
- **GET /settings**
- Returns the current system settings

**Response Example:**
```json
{
  "id": "settings-uuid",
  "currency": "USD",
  "language": "en",
  "fiscalYear": "2024",
  "taxRate": 15.0
}
```

### Update Settings
- **PATCH /settings**
- Updates one or more settings fields

**Request Example:**
```json
{
  "currency": "EUR",
  "taxRate": 20
}
```

**Response Example:**
```json
{
  "id": "settings-uuid",
  "currency": "EUR",
  "language": "en",
  "fiscalYear": "2024",
  "taxRate": 20.0
}
```

## Usage

- Fetch current settings to display or use in other modules
- Update settings as needed (e.g., change currency, update tax rate)
- Settings are auto-initialized if not present in the database

## Error Handling

- Returns validation errors for invalid input (e.g., taxRate out of range)
- Returns updated settings after a successful update

**Validation Error Example:**
```json
{
  "statusCode": 400,
  "message": [
    "taxRate must not be greater than 100"
  ],
  "error": "Bad Request"
}
```

## Integration

- **Accounting, Sales, Purchasing, Reports**: Use settings for currency, tax calculations, and localization
- **Extensible**: Add new fields to the entity and DTO as business needs grow

## Extending the Module

- Add enums or lists for allowed currencies/languages for stricter validation
- Add audit logging for settings changes
- Support multi-tenant settings if needed

## Testing

- Test endpoints with various valid and invalid payloads
- Ensure settings are created if missing
- Validate that updates persist and are reflected in subsequent GET requests

---

This module ensures your application's configuration is consistent, secure, and easy to manage. For further customization, simply extend the entity and DTOs as your requirements evolve. 