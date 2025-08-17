# Store Backend

A **comprehensive, enterprise-grade store management system** built with [NestJS](https://nestjs.com/) that provides a complete solution for managing retail/inventory operations. This backend combines traditional business logic with cutting-edge AI capabilities, featuring an intelligent AI agent that allows natural language interaction with your business data.

## 🚀 What This Application Does

This is a **modern, AI-powered approach to enterprise resource planning (ERP)** that transforms traditional business management into an intelligent, conversational interface. Users can interact with the entire system using natural language queries, making complex data analysis accessible to non-technical users.

### **Core Business Capabilities**
- **Inventory Management**: Products, batches, stock movements, and adjustments
- **Sales & Invoicing**: Invoice creation, payments, and sales tracking  
- **Purchasing**: Supplier and purchase order management
- **Accounting**: Journal entries, accounts, and financial tracking
- **Client Management**: Customer records and tagging
- **User Management**: Role-based access control and permissions
- **Reporting**: Business and financial reports generation

### **🤖 Advanced AI Features**

The most innovative aspect is the **AI Agent system** that provides:

- **Natural Language Queries**: Ask questions like "Show me low stock products" or "List users with admin role"
- **Semantic Search**: Uses pgvector and embeddings to find relevant data across all business modules
- **Local AI Processing**: Runs Llama3.1 8b model locally via Ollama (complete data privacy, no external APIs)
- **Automatic Data Sync**: Syncs all business data every 5 minutes for AI context
- **Intelligent Responses**: Provides natural language answers with formatted HTML tables
- **Business Context Understanding**: AI understands relationships between products, sales, inventory, and financial data

### **Example AI Queries**
- "What's our current inventory value?"
- "Show me clients with overdue payments"
- "List products that need restocking"
- "What's the profit margin for electronics category?"
- "Show users who haven't logged in recently"

## Features

- **Authentication & Authorization**: Secure JWT-based auth, role-based access control.
- **Inventory Management**: Products, batches, stock movements, and adjustments.
- **Sales & Invoicing**: Invoice creation, payments, and sales tracking.
- **Purchasing**: Supplier and purchase order management.
- **Accounting**: Journal entries, accounts, and audit logs.
- **Clients**: Client records and tagging.
- **Reporting**: Generate business and financial reports.
- **AI Forecasting**: Sales forecasting using AI models.
- **AI Agent**: Natural language interface for business intelligence.
- **Settings**: Application-wide configuration management.
- **Internationalization**: Multi-language support (e.g., English, Arabic).

## 🛡️ Security & Architecture

- **JWT Authentication** with role-based access control
- **Rate Limiting** with Redis-based throttling
- **Input Validation** and sanitization
- **Audit Logging** for security tracking
- **Multi-language Support** (English/Arabic)
- **Docker Containerization** for easy deployment
- **Local AI Processing** for complete data privacy

## Project Structure

```
src/
  accounting/      # Accounting logic, journal entries, accounts
  ai/              # AI-powered features (e.g., sales forecasting)
  ai-agent/        # AI Agent with natural language interface
  auth/            # Authentication, authorization, guards, strategies
  clients/         # Client management
  common/          # Shared modules, config, interceptors, pipes
  inventory/       # Product, batch, and stock management
  purchasing/      # Supplier and purchase order management
  reports/         # Reporting features
  sales/           # Sales, invoices, payments
  settings/        # Application settings
  users/           # User management
  main.ts          # Application entry point
```

## 🔧 Technical Stack

- **Backend Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with pgvector extension for AI embeddings
- **AI/ML**: LangChain.js + Llama3.1 8b + HuggingFace embeddings
- **Caching**: Redis for session management and rate limiting
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest for unit and e2e tests
- **Containerization**: Docker & Docker Compose

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/) (v8+ recommended)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [Ollama](https://ollama.ai/) (for local AI processing)

### Quick Start with Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd backend
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api
   - AI Agent: Available at `/ai-agent/chat` endpoint

### Manual Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and update values as needed (database, JWT secret, etc.).

4. **Setup PostgreSQL with pgvector:**
   ```bash
   # Install pgvector extension
   psql -U postgres -d your_database -f init-pgvector.sql
   ```

5. **Setup Ollama for AI features:**
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Start Ollama and pull the AI model
   ollama serve
   ollama pull llama3.1:8b
   ```

6. **Run database migrations (if applicable):**
   ```bash
   # Example using TypeORM CLI
   npm run typeorm migration:run
   ```

### Running the Application

- **Development:**
  ```bash
  npm run start:dev
  ```

- **Production:**
  ```bash
  npm run build
  npm run start:prod
  ```

### Testing

- **Unit tests:**
  ```bash
  npm run test
  ```

- **End-to-end tests:**
  ```bash
  npm run test:e2e
  ```

- **Linting:**
  ```bash
  npm run lint
  ```

## 🚀 AI Agent Usage

### Making AI Queries

Send natural language queries to the AI agent:

```bash
curl -X POST "http://localhost:3000/ai-agent/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query": "Show me low stock products"}'
```

### Example AI Responses

The AI agent provides:
- **Natural language explanations**
- **Formatted HTML tables** for data display
- **Source document references**
- **Context-aware insights**

## API Documentation

- The API is documented using [Swagger](https://swagger.io/).
- Once the server is running, visit: `http://localhost:3000/api` (or your configured port).

## 🔍 Key Innovation

The AI Agent transforms this from a traditional business management system into an **intelligent, conversational interface** that can:

- Understand business context and relationships
- Provide actionable insights through natural language
- Maintain complete data privacy through local AI processing
- Automatically sync and analyze all business data
- Generate formatted reports and visualizations

This represents a modern approach to ERP systems, combining robust business logic with cutting-edge AI capabilities.

## Contributing

1. Fork the repository.
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request.

## License

This project is licensed under the MIT License.

---

**Note:**  
- For detailed module usage, see the `README.md` files within each module directory.
- For environment configuration, refer to the `common/config` directory.
- For AI Agent implementation details, see `AI_AGENT_IMPLEMENTATION_SUMMARY.md`.
