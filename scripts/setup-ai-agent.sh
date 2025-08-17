#!/bin/bash

# AI Agent Setup Script for SaaS Inventory Management System
# This script sets up PostgreSQL with pgvector, Ollama with Llama3.1 8b, and the NestJS application

set -e

echo "🚀 Setting up AI Agent for SaaS Inventory Management System"
echo "=========================================================="

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

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        print_status "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        print_status "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        print_status "Visit: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Install npm dependencies
install_dependencies() {
    print_status "Installing npm dependencies..."
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    npm install
    print_success "Dependencies installed successfully"
}

# Setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env
            print_success "Created .env file from env.example"
            print_warning "Please review and update .env file with your configuration"
        else
            print_error "env.example not found. Please create .env file manually."
            exit 1
        fi
    else
        print_warning ".env file already exists. Skipping creation."
    fi
}

# Initialize PostgreSQL with pgvector
setup_postgres() {
    print_status "Setting up PostgreSQL with pgvector..."
    
    # Check if PostgreSQL container is running
    if docker ps | grep -q "store_postgres"; then
        print_warning "PostgreSQL container is already running"
    else
        print_status "Starting PostgreSQL with pgvector..."
        docker-compose up -d postgres
        
        # Wait for PostgreSQL to be ready
        print_status "Waiting for PostgreSQL to be ready..."
        sleep 10
        
        # Check if PostgreSQL is responding
        for i in {1..30}; do
            if docker exec store_postgres pg_isready -U langchain -d langchain &> /dev/null; then
                print_success "PostgreSQL is ready"
                break
            fi
            if [ $i -eq 30 ]; then
                print_error "PostgreSQL failed to start within 30 seconds"
                exit 1
            fi
            sleep 1
        done
    fi
    
    # Initialize pgvector extension and tables
    print_status "Initializing pgvector extension and tables..."
    if [ -f "init-pgvector.sql" ]; then
        docker exec -i store_postgres psql -U langchain -d langchain < init-pgvector.sql
        print_success "pgvector extension and tables initialized"
    else
        print_error "init-pgvector.sql not found"
        exit 1
    fi
}

# Setup Ollama with Llama3.1 8b
setup_ollama() {
    print_status "Setting up Ollama with Llama3.1 8b..."
    
    # Check if Ollama container is running
    if docker ps | grep -q "store_ollama"; then
        print_warning "Ollama container is already running"
    else
        print_status "Starting Ollama..."
        docker-compose up -d ollama
        
        # Wait for Ollama to be ready
        print_status "Waiting for Ollama to be ready..."
        sleep 15
        
        # Check if Llama3.1 8b model is available
        print_status "Checking Llama3.1 8b model..."
        for i in {1..60}; do
            if curl -s http://localhost:11434/api/tags | grep -q "llama3.1:8b"; then
                print_success "Llama3.1 8b model is ready"
                break
            fi
            if [ $i -eq 60 ]; then
                print_warning "Llama3.1 8b model may still be downloading. This can take several minutes."
                print_status "You can check progress with: docker-compose logs -f ollama"
            fi
            sleep 5
        done
    fi
}

# Build and start the application
start_application() {
    print_status "Building and starting the application..."
    
    # Build the application
    docker-compose build backend
    
    # Start all services
    docker-compose up -d
    
    print_success "Application started successfully"
    print_status "Services are starting up. This may take a few minutes..."
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Wait for services to be ready
    sleep 30
    
    # Check backend health
    if curl -s http://localhost:3000/health &> /dev/null; then
        print_success "Backend is healthy"
    else
        print_warning "Backend health check failed. It may still be starting up."
    fi
    
    # Check AI agent health
    if curl -s http://localhost:3000/ai-agent/health &> /dev/null; then
        print_success "AI Agent is healthy"
    else
        print_warning "AI Agent health check failed. It may still be initializing."
    fi
}

# Display final information
show_final_info() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "=================================="
    echo ""
    echo "Services running:"
    echo "  • PostgreSQL with pgvector: localhost:5432"
    echo "  • Ollama with Llama3.1 8b: localhost:11434"
    echo "  • NestJS Backend: localhost:3000"
    echo ""
    echo "Useful commands:"
    echo "  • View logs: docker-compose logs -f"
    echo "  • Stop services: docker-compose down"
    echo "  • Restart services: docker-compose restart"
    echo "  • Check AI agent: curl http://localhost:3000/ai-agent/health"
    echo ""
    echo "API Documentation:"
    echo "  • Swagger UI: http://localhost:3000/api"
    echo ""
    echo "Example AI Agent queries:"
    echo "  • List users with admin role"
    echo "  • Check stock for product X"
    echo "  • Show ledger balance for account Y"
    echo ""
    print_warning "Remember to update your .env file with proper configuration for production!"
}

# Main setup function
main() {
    echo "Starting AI Agent setup..."
    echo ""
    
    check_docker
    check_nodejs
    install_dependencies
    setup_environment
    setup_postgres
    setup_ollama
    start_application
    check_health
    show_final_info
}

# Run main function
main "$@" 