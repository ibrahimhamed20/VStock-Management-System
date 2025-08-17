# Reports Module

The Reports module provides financial reporting capabilities, including generation of Balance Sheet and Income Statement (Profit & Loss) reports. It aggregates accounting data and supports date filtering for accurate, period-based reporting.

## Features

- **Balance Sheet**: Summarizes assets, liabilities, and equity as of a specific date
- **Income Statement**: Summarizes revenue, expenses, and net income for a date range
- **Date Filtering**: Generate reports for any period
- **REST API**: Endpoints for retrieving reports
- **Validation**: Input validation for date filters
- **Integration**: Uses the accounting module for real-time data

## API Endpoints

### Get Balance Sheet
- **GET /reports/balance-sheet?endDate=YYYY-MM-DD**
- Returns the balance sheet as of the specified date (or current date if omitted)

**Response Example:**
```json
{
  "asOf": "2024-06-30",
  "assets": [
    { "code": "1000", "name": "Cash", "type": "asset", "balance": 5000 }
  ],
  "liabilities": [
    { "code": "2000", "name": "Accounts Payable", "type": "liability", "balance": 2000 }
  ],
  "equity": [
    { "code": "3000", "name": "Owner's Equity", "type": "equity", "balance": 3000 }
  ],
  "totalAssets": 5000,
  "totalLiabilities": 2000,
  "totalEquity": 3000
}
```

### Get Income Statement
- **GET /reports/income-statement?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD**
- Returns the income statement for the specified date range

**Response Example:**
```json
{
  "from": "2024-06-01",
  "to": "2024-06-30",
  "revenue": [
    { "accountId": "rev-uuid", "amount": 10000 }
  ],
  "expenses": [
    { "accountId": "exp-uuid", "amount": 7000 }
  ],
  "totalRevenue": 10000,
  "totalExpenses": 7000,
  "netIncome": 3000
}
```

## DTOs

### ReportFilterDto
```typescript
{
  startDate?: string; // Optional, ISO date string (for income statement)
  endDate?: string;   // Optional, ISO date string (for both reports)
}
```

## Business Logic

- **Balance Sheet**: Uses the accounting module's trial balance to aggregate all asset, liability, and equity accounts as of the specified date.
- **Income Statement**: Fetches all journal entries in the date range, aggregates revenue and expense accounts, and calculates net income.
- **Account Types**: Relies on account type classification (asset, liability, equity, revenue, expense) for correct report grouping.

## Usage

- Use the endpoints to generate financial statements for any period
- Integrate with frontend dashboards or export to Excel for further analysis
- Supports real-time reporting based on up-to-date accounting data

## Error Handling

- Returns validation errors for invalid date formats
- Returns empty arrays if no data is available for the period

**Validation Error Example:**
```json
{
  "statusCode": 400,
  "message": [
    "endDate must be a valid ISO 8601 date string"
  ],
  "error": "Bad Request"
}
```

## Integration

- **Accounting Module**: Pulls data from accounts and journal entries
- **Settings Module**: Can use system settings for currency, fiscal year, etc.
- **Frontend**: Display reports in dashboards or export for compliance

## Extending the Module

- Add more report types (e.g., Cash Flow Statement, custom analytics)
- Support multi-currency or multi-tenant reporting
- Add export endpoints (CSV, Excel, PDF)
- Add role-based access control for sensitive reports

## Testing

- Test endpoints with various date ranges and data scenarios
- Validate correct aggregation and calculation of balances
- Ensure error handling for invalid input

---

This module enables robust, real-time financial reporting for your business. Extend it as your reporting needs grow! 