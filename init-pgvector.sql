-- PostgreSQL initialization script with pgvector extension
-- This script sets up the database for the AI Agent with optimized indexes

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the system_data table for storing embeddings
CREATE TABLE IF NOT EXISTS system_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    metadata JSONB,
    vector vector(384), -- 384-dimensional vectors
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better AI Agent performance
-- GIN indexes for JSONB metadata queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_data_entity_type 
ON system_data USING GIN ((metadata->>'entity_type'));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_data_timestamp 
ON system_data USING GIN ((metadata->>'timestamp'));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_data_user_id 
ON system_data USING GIN ((metadata->>'user_id'));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_data_product_id 
ON system_data USING GIN ((metadata->>'product_id'));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_data_client_id 
ON system_data USING GIN ((metadata->>'client_id'));

-- HNSW index for fast vector similarity search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_data_vector 
ON system_data USING hnsw (vector vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- Regular indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_data_created_at 
ON system_data(created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_data_updated_at 
ON system_data(updated_at);

-- Create conversations table for AI Agent chat history
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table for conversation messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sync_status table for tracking data synchronization
CREATE TABLE IF NOT EXISTS sync_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL UNIQUE,
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checksum VARCHAR(255),
    document_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for conversations and messages
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_user_id 
ON conversations(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_updated_at 
ON conversations(updated_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_id 
ON messages(conversation_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_created_at 
ON messages(created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_role 
ON messages(role);

-- Indexes for sync_status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sync_status_entity_type 
ON sync_status(entity_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sync_status_last_sync 
ON sync_status(last_sync);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_system_data_updated_at 
    BEFORE UPDATE ON system_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_status_updated_at 
    BEFORE UPDATE ON sync_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get system data statistics
CREATE OR REPLACE FUNCTION get_system_data_stats()
RETURNS TABLE (
    total_documents BIGINT,
    entity_types JSONB,
    latest_update TIMESTAMP WITH TIME ZONE,
    vector_dimensions INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_documents,
        jsonb_object_agg(entity_type, count) as entity_types,
        MAX(updated_at) as latest_update,
        384 as vector_dimensions
    FROM (
        SELECT 
            metadata->>'entity_type' as entity_type,
            COUNT(*) as count
        FROM system_data 
        GROUP BY metadata->>'entity_type'
    ) stats;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old data (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_system_data(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM system_data 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to optimize vector store (VACUUM and ANALYZE)
CREATE OR REPLACE FUNCTION optimize_vector_store()
RETURNS VOID AS $$
BEGIN
    VACUUM ANALYZE system_data;
    VACUUM ANALYZE conversations;
    VACUUM ANALYZE messages;
    VACUUM ANALYZE sync_status;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Create a view for easy monitoring
CREATE OR REPLACE VIEW ai_agent_stats AS
SELECT 
    'system_data' as table_name,
    COUNT(*) as record_count,
    MAX(updated_at) as last_updated
FROM system_data
UNION ALL
SELECT 
    'conversations' as table_name,
    COUNT(*) as record_count,
    MAX(updated_at) as last_updated
FROM conversations
UNION ALL
SELECT 
    'messages' as table_name,
    COUNT(*) as record_count,
    MAX(created_at) as last_updated
FROM messages
UNION ALL
SELECT 
    'sync_status' as table_name,
    COUNT(*) as record_count,
    MAX(updated_at) as last_updated
FROM sync_status;

-- Insert initial sync status records
INSERT INTO sync_status (entity_type, last_sync, checksum, document_count) VALUES
('users', NOW() - INTERVAL '1 day', '', 0),
('clients', NOW() - INTERVAL '1 day', '', 0),
('products', NOW() - INTERVAL '1 day', '', 0),
('suppliers', NOW() - INTERVAL '1 day', '', 0),
('purchases', NOW() - INTERVAL '1 day', '', 0),
('invoices', NOW() - INTERVAL '1 day', '', 0),
('ledgers', NOW() - INTERVAL '1 day', '', 0),
('balances', NOW() - INTERVAL '1 day', '', 0),
('system_features', NOW() - INTERVAL '1 day', '', 0)
ON CONFLICT (entity_type) DO NOTHING; 