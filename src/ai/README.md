# AI Module

The AI module provides endpoints for AI-powered features such as sales forecasting, financial summaries, product recommendations, anomaly detection, and natural language Q&A. It is designed to integrate with external AI/ML services (e.g., Python-based APIs) for advanced analytics and automation.

## Features

- **Sales Forecasting**: Predict future sales using time-series or ML models
- **Financial Summaries**: Auto-generate insights (e.g., "Top 3 sales this week")
- **Product Recommendation**: Suggest products based on sales patterns
- **Anomaly Detection**: Identify unusual accounting entries
- **Natural Language Q&A**: Ask questions and get answers from financial data
- **External AI Service Integration**: Calls out to a Python/ML backend via HTTP (stubbed, ready for real integration)

## API Endpoints

### Sales Forecasting
- **POST /ai/forecast**
- Request: `{ productId, startDate, endDate, periods? }`
- Response: Array of forecasted sales per period

### Financial Summaries
- **POST /ai/summary**
- Request: `{ ...context }`
- Response: Summary insights (stubbed)

### Product Recommendation
- **POST /ai/recommend**
- Request: `{ ...context }`
- Response: Recommended products (stubbed)

### Anomaly Detection
- **POST /ai/anomaly**
- Request: `{ ...context }`
- Response: Anomaly detection results (stubbed)

### Natural Language Q&A
- **POST /ai/ask**
- Request: `{ question: string }`
- Response: AI-generated answer (stubbed)

## DTOs

### ForecastDto
```typescript
{
  productId: string;   // Required
  startDate: string;   // Required, ISO date
  endDate: string;     // Required, ISO date
  periods?: number;    // Optional, number of forecast periods
}
```

## Architecture

- **ExternalAiService**: Handles HTTP calls to an external AI/ML API (Python, etc.). Currently stubbed; replace with real HTTP logic for production.
- **AiService**: Orchestrates all AI-powered features, delegating to ExternalAiService.
- **Controllers**: Expose endpoints for each AI feature.
- **Models**: Pluggable ML logic (currently stubbed, ready for real models).

## Usage

- Call endpoints to get AI-powered insights, forecasts, and answers.
- Integrate with a real AI/ML backend by implementing HTTP calls in `ExternalAiService`.
- Extend DTOs and endpoints as new AI features are added.

## Integration

- **Python/ML Backend**: Configure ExternalAiService to call your AI/ML API (Flask, FastAPI, etc.).
- **Frontend**: Use endpoints for dashboards, analytics, and interactive Q&A.
- **Other Modules**: Use recommendations, summaries, and anomaly detection to automate business logic.

## Extending the Module

- Implement real HTTP calls in `ExternalAiService` for production use.
- Add authentication and error handling for secure AI API integration.
- Plug in real ML/time-series models for forecasting and recommendations.
- Add more endpoints for new AI-powered features as needed.

## Best Practices

- Use a separate, scalable AI/ML backend for heavy analytics.
- Ensure sufficient historical data for accurate model training.
- Monitor and log AI/ML predictions for quality and compliance.
- Secure all AI endpoints and external API calls.

## Example: Integrating with a Python AI Service
```typescript
// In ExternalAiService
import axios from 'axios';
async postToAiApi(endpoint: string, payload: any) {
  const response = await axios.post(`http://localhost:5000${endpoint}`, payload);
  return response.data;
}
```

---

This module provides a flexible foundation for AI-driven business features. Extend and connect it to your preferred AI/ML stack as your needs grow! 