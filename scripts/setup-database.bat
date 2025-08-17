@echo off
echo 🚀 Store Management Database Setup Script
echo ==========================================

REM Check if Docker is running
echo [INFO] Checking Docker status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)
echo [SUCCESS] Docker is running

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] docker-compose is not installed. Please install it first.
    pause
    exit /b 1
)

REM Stop any existing containers
echo [INFO] Stopping existing containers...
docker-compose down

REM Start PostgreSQL
echo [INFO] Starting PostgreSQL database...
docker-compose up postgres -d

REM Wait for PostgreSQL to be ready
echo [INFO] Waiting for PostgreSQL to be ready...
timeout /t 10 /nobreak >nul

REM Check if PostgreSQL is running
docker-compose ps postgres | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] PostgreSQL is running
) else (
    echo [ERROR] PostgreSQL failed to start
    echo [INFO] Checking PostgreSQL logs...
    docker-compose logs postgres
    pause
    exit /b 1
)

REM Test database connection
echo [INFO] Testing database connection...
docker-compose exec postgres pg_isready -U postgres -d store_management_db
if %errorlevel% equ 0 (
    echo [SUCCESS] Database connection successful
) else (
    echo [ERROR] Database connection failed
    echo [INFO] Checking PostgreSQL logs...
    docker-compose logs postgres
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo [INFO] Creating .env file...
    (
        echo # Database Configuration
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_USER=postgres
        echo DB_PASS=root
        echo DB_NAME=store_management_db
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=bc790baccea34618aa79c2566d13638172b52417de022a62cecde5b9ad222867
        echo JWT_EXPIRES_IN=24h
        echo.
        echo # Application Configuration
        echo NODE_ENV=development
        echo PORT=3000
        echo.
        echo # AI Configuration
        echo OLLAMA_URL=http://localhost:11434
        echo OLLAMA_MODEL=llama3.1:8b
    ) > .env
    echo [SUCCESS] .env file created
) else (
    echo [INFO] .env file already exists
)

REM Test database connection with Node.js
echo [INFO] Testing database connection with Node.js...
npm run test:db-connection
if %errorlevel% equ 0 (
    echo [SUCCESS] Node.js database connection test successful
) else (
    echo [WARNING] Node.js database connection test failed
    echo [INFO] You may need to check your environment variables
)

echo.
echo [SUCCESS] Database setup completed!
echo.
echo Next steps:
echo 1. Run the seeding script: npm run seed:comprehensive
echo 2. Insert purchase data: npm run insert:purchase-data
echo 3. Insert invoice data: npm run insert:invoice-data
echo 4. Start the application: npm run start:dev
echo.
echo Useful commands:
echo - Check database logs: docker-compose logs postgres
echo - Access database: docker-compose exec postgres psql -U postgres -d store_management_db
echo - Stop database: docker-compose down
echo.
pause 