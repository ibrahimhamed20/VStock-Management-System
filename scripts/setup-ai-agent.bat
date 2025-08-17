@echo off
setlocal enabledelayedexpansion

echo 🚀 Setting up AI Agent for SaaS Inventory Management System
echo ==========================================================

REM Check if Docker is installed
echo [INFO] Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker first.
    echo [INFO] Visit: https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    echo [INFO] Visit: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

echo [SUCCESS] Docker and Docker Compose are installed

REM Check if Node.js is installed
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    echo [INFO] Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo [SUCCESS] Node.js is installed

REM Install npm dependencies
echo [INFO] Installing npm dependencies...
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [SUCCESS] Dependencies installed successfully

REM Setup environment file
echo [INFO] Setting up environment configuration...
if not exist ".env" (
    if exist "env.example" (
        copy env.example .env >nul
        echo [SUCCESS] Created .env file from env.example
        echo [WARNING] Please review and update .env file with your configuration
    ) else (
        echo [ERROR] env.example not found. Please create .env file manually.
        pause
        exit /b 1
    )
) else (
    echo [WARNING] .env file already exists. Skipping creation.
)

REM Setup PostgreSQL with pgvector
echo [INFO] Setting up PostgreSQL with pgvector...
docker ps | findstr "store_postgres" >nul
if errorlevel 1 (
    echo [INFO] Starting PostgreSQL with pgvector...
    docker-compose up -d postgres
    
    echo [INFO] Waiting for PostgreSQL to be ready...
    timeout /t 10 /nobreak >nul
    
    REM Check if PostgreSQL is responding
    for /l %%i in (1,1,30) do (
        docker exec store_postgres pg_isready -U langchain -d langchain >nul 2>&1
        if not errorlevel 1 (
            echo [SUCCESS] PostgreSQL is ready
            goto :postgres_ready
        )
        timeout /t 1 /nobreak >nul
    )
    echo [ERROR] PostgreSQL failed to start within 30 seconds
    pause
    exit /b 1
) else (
    echo [WARNING] PostgreSQL container is already running
)

:postgres_ready
REM Initialize pgvector extension and tables
echo [INFO] Initializing pgvector extension and tables...
if exist "init-pgvector.sql" (
    docker exec -i store_postgres psql -U langchain -d langchain < init-pgvector.sql
    echo [SUCCESS] pgvector extension and tables initialized
) else (
    echo [ERROR] init-pgvector.sql not found
    pause
    exit /b 1
)

REM Setup Ollama with Llama3.1 8b
echo [INFO] Setting up Ollama with Llama3.1 8b...
docker ps | findstr "store_ollama" >nul
if errorlevel 1 (
    echo [INFO] Starting Ollama...
    docker-compose up -d ollama
    
    echo [INFO] Waiting for Ollama to be ready...
    timeout /t 15 /nobreak >nul
    
    REM Check if Llama3.1 8b model is available
    echo [INFO] Checking Llama3.1 8b model...
    for /l %%i in (1,1,60) do (
        curl -s http://localhost:11434/api/tags | findstr "llama3.1:8b" >nul
        if not errorlevel 1 (
            echo [SUCCESS] Llama3.1 8b model is ready
            goto :ollama_ready
        )
        timeout /t 5 /nobreak >nul
    )
    echo [WARNING] Llama3.1 8b model may still be downloading. This can take several minutes.
    echo [INFO] You can check progress with: docker-compose logs -f ollama
) else (
    echo [WARNING] Ollama container is already running
)

:ollama_ready
REM Build and start the application
echo [INFO] Building and starting the application...
docker-compose build backend
docker-compose up -d

echo [SUCCESS] Application started successfully
echo [INFO] Services are starting up. This may take a few minutes...

REM Check service health
echo [INFO] Checking service health...
timeout /t 30 /nobreak >nul

REM Check backend health
curl -s http://localhost:3000/health >nul 2>&1
if not errorlevel 1 (
    echo [SUCCESS] Backend is healthy
) else (
    echo [WARNING] Backend health check failed. It may still be starting up.
)

REM Check AI agent health
curl -s http://localhost:3000/ai-agent/health >nul 2>&1
if not errorlevel 1 (
    echo [SUCCESS] AI Agent is healthy
) else (
    echo [WARNING] AI Agent health check failed. It may still be initializing.
)

REM Display final information
echo.
echo 🎉 Setup completed successfully!
echo ==================================
echo.
echo Services running:
echo   • PostgreSQL with pgvector: localhost:5432
echo   • Ollama with Llama3.1 8b: localhost:11434
echo   • NestJS Backend: localhost:3000
echo.
echo Useful commands:
echo   • View logs: docker-compose logs -f
echo   • Stop services: docker-compose down
echo   • Restart services: docker-compose restart
echo   • Check AI agent: curl http://localhost:3000/ai-agent/health
echo.
echo API Documentation:
echo   • Swagger UI: http://localhost:3000/api
echo.
echo Example AI Agent queries:
echo   • List users with admin role
echo   • Check stock for product X
echo   • Show ledger balance for account Y
echo.
echo [WARNING] Remember to update your .env file with proper configuration for production!
echo.
pause 