# AI Agent Module

A comprehensive AI-powered internal agent for the SaaS Inventory Management and Accounting System, built with LangChain.js, pgvector, and Llama3.1 8b.

## Features

- **Semantic Search**: Uses pgvector with HNSW indexing for fast vector similarity search
- **Local LLM**: Integrates with Llama3.1 8b via Ollama for data privacy
- **Multi-Module Support**: Handles queries across users, clients, inventory, and accounting
- **Automatic Sync**: Periodically syncs all database entities to vector store
- **Context-Aware Responses**: Uses RetrievalQAChain for intelligent query processing
- **HTML Generation**: Automatically generates formatted HTML tables for frontend display
- **Admin Panel**: Dedicated admin service for monitoring and management
- **Automatic Fallback**: Seamlessly switches from Hugging Face to Ollama when credits are exhausted

## Architecture

### Components

1. **PGVectorStore**: Stores embeddings of all database entities
2. **HuggingFace Embeddings**: Uses `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions)
3. **Llama3.1 8b**: Local LLM via Ollama for natural language processing
4. **RetrievalQAChain**: Combines vector search with LLM for context-aware responses
5. **Cron Jobs**: Automatic data synchronization every 5 minutes
6. **AdminService**: Dedicated service for admin panel functionality

### Service Structure

```
src/ai-agent/
├── ai-agent.controller.ts     # Main API endpoints
├── ai-agent.service.ts        # Core business logic
├── ai-agent.module.ts         # Module configuration
├── services/                  # Service layer
│   ├── llm.service.ts         # LLM integration (Ollama + Hugging Face)
│   ├── vector-store.service.ts # Vector database operations
│   ├── embeddings.service.ts  # Text embedding generation
│   ├── enhanced-search.service.ts # Advanced search functionality
│   ├── conversation.service.ts # Chat session management
│   ├── sync.service.ts        # Data synchronization
│   ├── admin.service.ts       # Admin panel functionality
│   └── index.ts              # Service exports
├── controllers/               # Controllers
│   ├── ai-admin-panel.controller.ts # Admin panel endpoints
│   ├── conversations.controller.ts  # Conversation management
│   └── index.ts              # Controller exports
├── entities/                  # Database entities
│   ├── conversation.entity.ts # Chat conversation entity
│   ├── message.entity.ts      # Chat message entity
│   ├── sync-status.entity.ts  # Sync status tracking
│   └── index.ts              # Entity exports
├── dtos/                     # Data transfer objects
│   └── chat.dto.ts           # Chat-related DTOs
├── prompts/                  # AI prompts
│   └── assistant.prompt.ts   # System prompt template
└── README.md                 # This file
```

### Data Flow

1. **Initialization**: Module loads, initializes vector store and LLM
2. **Data Sync**: All entities (users, clients, products, accounts) are embedded and stored
3. **Query Processing**: User query → Vector search → Context retrieval → LLM response
4. **Response Generation**: Natural language + HTML table + source documents
5. **Admin Monitoring**: AdminService provides monitoring and management capabilities

## Setup

### Prerequisites

1. **PostgreSQL with pgvector**:
   ```bash
   # Run the initialization script
   psql -U langchain -d langchain -f init-pgvector.sql
   ```

2. **Ollama with Llama3.1 8b**:
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Pull Llama3.1 8b model
   ollama pull llama3.1:8b
   
   # Start Ollama
   ollama serve
   ```

3. **Environment Variables**:
   ```bash
   # Copy example environment file
   cp env.example .env
   
   # Update with your configuration
   DATABASE_URL=postgresql://langchain:langchain@localhost:5432/langchain
   OLLAMA_URL=http://localhost:11434
   JWT_SECRET=your-super-secret-jwt-key
   ```

### Docker Setup

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
```

## API Endpoints

### Main AI Agent
- `POST /ai-agent/chat` - Send a query to the AI agent
- `POST /ai-agent/search/enhanced` - Perform enhanced search
- `GET /ai-agent/health` - Check AI agent health status
- `GET /ai-agent/provider/huggingface/credits` - Check Hugging Face credit status
- `POST /ai-agent/provider/huggingface/credits/reset` - Reset Hugging Face credit status (Admin only)

### Admin Panel
- `GET /ai-admin-panel/admin/sync-status` - Get data synchronization status
- `GET /ai-admin-panel/admin/health` - Get detailed AI agent health status
- `GET /ai-admin-panel/admin/data-quality` - Get data quality report
- `GET /ai-admin-panel/admin/performance` - Get performance metrics
- `POST /ai-admin-panel/admin/sync/:entityType` - Force sync specific entity type
- `DELETE /ai-admin-panel/admin/vector-store` - Clear vector store
- `GET /ai-admin-panel/debug/similar/:query` - Debug: Search similar content

### Conversations
- `GET /ai-agent/conversations` - List user conversations
- `GET /ai-agent/conversations/:id/messages` - Get conversation messages
- `PATCH /ai-agent/conversations/:id/title` - Update conversation title
- `DELETE /ai-agent/conversations/:id` - Delete a conversation
- `GET /ai-agent/conversations/:id/search` - Search within conversation messages

## Example Queries

### User Management
- "List users with admin role"
- "Show me users who haven't logged in recently"
- "Get user details for john.doe@example.com"
- "How do I reset a user's password?"

### Inventory Management
- "Check stock for product X"
- "Show low stock products"
- "List products in electronics category"
- "What's the current inventory value?"

### Client Management
- "List all clients"
- "Show clients with overdue payments"
- "Find clients in New York"

### Accounting
- "Show ledger balance for account Y"
- "What's the current cash balance?"
- "List recent journal entries"
- "Show profit and loss summary"

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `OLLAMA_URL` | Ollama API URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | LLM model name | `llama3.1:8b` |
| `VECTOR_STORE_TABLE` | Vector store table name | `system_data` |
| `EMBEDDING_MODEL` | Embedding model name | `sentence-transformers/all-MiniLM-L6-v2` |
| `VECTOR_DIMENSIONS` | Vector dimensions | `384` |
| `SYNC_INTERVAL` | Sync interval in ms | `300000` (5 min) |

### Automatic Fallback Configuration

The system automatically handles Hugging Face credit limits:

- **Credit Detection**: Automatically detects when Hugging Face credits are exhausted
- **Seamless Fallback**: Switches to local Ollama without user intervention
- **No Error Display**: Users don't see credit limit errors
- **Credit Reset**: Admins can reset credit status when credits are restored

**Credit Limit Error Patterns Detected:**
- "credits exhausted"
- "quota exceeded" 
- "monthly included credits"
- "subscribe to pro"
- "InferenceClientProviderApiError"

### Vector Store Schema

```sql
CREATE TABLE system_data (
    id UUID PRIMARY KEY,
    vector vector(384),
    content TEXT NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

## Service Responsibilities

### AiAgentService
- Core business logic for AI queries
- Query handling and caching
- Enhanced search functionality
- Provider management (Ollama/Hugging Face)

### AdminService
- Sync status monitoring
- Service health checks
- Data quality reports
- Performance metrics
- Vector store management
- Debug operations

### SyncService
- Data synchronization
- Entity embedding
- Vector store updates
- Sync status tracking

### ConversationService
- Chat session management
- Message persistence
- Conversation history
- HTML generation

## Extending the System

### Adding New Entities

1. **Update Service**: Add sync method in `SyncService`
2. **Add Entity**: Include entity in module imports
3. **Update Sync**: Add to `syncAllData()` method

Example:
```typescript
private async syncNewEntity() {
  const entities = await this.newEntityService.findAll();
  const documents = entities.map(entity => ({
    id: `newentity_${entity.id}`,
    content: `New Entity: ${entity.name} (${entity.description})`,
    metadata: {
      entity_type: 'newentity',
      entity_id: entity.id,
      timestamp: new Date().toISOString(),
    },
  }));
  await this.addDocumentsToVectorStore(documents);
}
```

### Custom Prompts

Modify the RetrievalQAChain prompt template in `initializeLLM()`:

```typescript
const promptTemplate = PromptTemplate.fromTemplate(`
You are an AI assistant for a SaaS inventory and accounting system.
Use the following context to answer the user's question:

Context: {context}

Question: {question}

Answer the question based on the context provided. If the context doesn't contain enough information, say so.
`);

this.chain = RetrievalQAChain.fromLLM(this.llm, this.vectorStore, {
  returnSourceDocuments: true,
  verbose: false,
  prompt: promptTemplate,
});
```

## Monitoring and Debugging

### Health Checks
- **Vector Store**: Check PostgreSQL connection and table existence
- **Ollama**: Verify LLM availability and model loading
- **Sync Status**: Monitor data synchronization logs

### Logs
```bash
# View AI agent logs
docker-compose logs -f backend | grep "AiAgentService"

# Check vector store statistics
psql -U langchain -d langchain -c "SELECT * FROM get_system_data_stats();"
```

### Performance Optimization

1. **HNSW Index**: Optimized for fast similarity search
2. **Chunking**: Documents split into 1000-character chunks with 200-character overlap
3. **Batch Processing**: Efficient document addition to vector store
4. **Caching**: LLM responses cached for repeated queries

## Security Considerations

1. **Local Deployment**: All components run locally for data privacy
2. **Authentication**: JWT-based authentication required for all endpoints
3. **Role-Based Access**: Different permissions for different user roles
4. **Input Validation**: All queries validated and sanitized
5. **Rate Limiting**: Consider implementing rate limiting for production

## Troubleshooting

### Common Issues

1. **Vector Store Connection Error**:
   - Verify PostgreSQL is running with pgvector extension
   - Check database credentials and permissions
   - Ensure `system_data` table exists

2. **Ollama Connection Error**:
   - Verify Ollama is running on correct port
   - Check if Llama3.1 8b model is downloaded
   - Test with: `curl http://localhost:11434/api/tags`

3. **Embedding Model Error**:
   - Check internet connection for model download
   - Verify sufficient disk space
   - Check Python dependencies

4. **Sync Failures**:
   - Check service dependencies
   - Verify entity relationships
   - Review error logs for specific issues

### Debug Commands

```bash
# Test vector search
curl -X GET "http://localhost:3000/ai-agent/test-vector-search?query=admin&k=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Check AI agent health
curl -X GET "http://localhost:3000/ai-agent/health"

# View vector store contents
psql -U langchain -d langchain -c "SELECT COUNT(*) FROM system_data;"
```

## Testing

### Unit Tests
```bash
# Run AI agent tests
npm test -- --testPathPattern=ai-agent

# Run specific test file
npm test src/ai-agent/ai-agent.service.spec.ts
```

### Integration Tests
```bash
# Test with sample queries
curl -X POST "http://localhost:3000/ai-agent/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query": "List users with admin role"}'
```

## Future Enhancements

1. **Multi-Modal Support**: Add image and document processing
2. **Conversation Memory**: Maintain chat history and context
3. **Custom Actions**: Add executable actions (e.g., create user, update stock)
4. **Advanced Analytics**: Query analytics and usage patterns
5. **Model Fine-tuning**: Custom model training for domain-specific tasks
6. **Real-time Updates**: WebSocket support for live data updates 