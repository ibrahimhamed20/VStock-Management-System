#!/bin/bash

echo "🚀 Store Management Database Setup Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
print_status "Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi
print_success "Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install it first."
    exit 1
fi

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose down

# Start PostgreSQL
print_status "Starting PostgreSQL database..."
docker-compose up postgres -d

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
sleep 10

# Check if PostgreSQL is running
if docker-compose ps postgres | grep -q "Up"; then
    print_success "PostgreSQL is running"
else
    print_error "PostgreSQL failed to start"
    print_status "Checking PostgreSQL logs..."
    docker-compose logs postgres
    exit 1
fi

# Test database connection
print_status "Testing database connection..."
docker-compose exec postgres pg_isready -U postgres -d store_management_db

if [ $? -eq 0 ]; then
    print_success "Database connection successful"
else
    print_error "Database connection failed"
    print_status "Checking PostgreSQL logs..."
    docker-compose logs postgres
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=root
DB_NAME=store_management_db

# JWT Configuration
JWT_SECRET=bc790baccea34618aa79c2566d13638172b52417de022a62cecde5b9ad222867
JWT_EXPIRES_IN=24h

# Application Configuration
NODE_ENV=development
PORT=3000

# AI Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
EOF
    print_success ".env file created"
else
    print_status ".env file already exists"
fi

# Test database connection with Node.js
print_status "Testing database connection with Node.js..."
npm run test:db-connection

if [ $? -eq 0 ]; then
    print_success "Node.js database connection test successful"
else
    print_warning "Node.js database connection test failed"
    print_status "You may need to check your environment variables"
fi

echo ""
print_success "Database setup completed!"
echo ""
echo "Next steps:"
echo "1. Run the seeding script: npm run seed:comprehensive"
echo "2. Insert purchase data: npm run insert:purchase-data"
echo "3. Insert invoice data: npm run insert:invoice-data"
echo "4. Start the application: npm run start:dev"
echo ""
echo "Useful commands:"
echo "- Check database logs: docker-compose logs postgres"
echo "- Access database: docker-compose exec postgres psql -U postgres -d store_management_db"
echo "- Stop database: docker-compose down" 