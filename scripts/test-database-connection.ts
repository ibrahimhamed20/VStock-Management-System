import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Create application context
    const app = await NestFactory.createApplicationContext(AppModule);
    const logger = new Logger('DatabaseConnectionTest');
    
    // Get the data source
    const dataSource = app.get(DataSource);
    
    console.log('\n📊 Database Configuration:');
    console.log('Database:', dataSource.options.database);
    
    // Test connection
    console.log('\n🔌 Testing connection...');
    const isConnected = dataSource.isInitialized;
    
    if (isConnected) {
      console.log('✅ Database connection is active!');
      
      // Test a simple query
      try {
        const result = await dataSource.query('SELECT version()');
        console.log('✅ Database query test successful!');
        console.log('PostgreSQL Version:', result[0].version);
        
        // Test if tables exist
        const tables = await dataSource.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name
        `);
        
        console.log('\n📋 Available tables:');
        if (tables.length > 0) {
          tables.forEach((table: any) => {
            console.log(`  - ${table.table_name}`);
          });
        } else {
          console.log('  No tables found in the database');
        }
        
      } catch (queryError) {
        console.error('❌ Database query test failed:', queryError.message);
      }
      
    } else {
      console.log('❌ Database connection is not active');
      
      // Try to initialize the connection
      try {
        console.log('🔄 Attempting to initialize connection...');
        await dataSource.initialize();
        console.log('✅ Database connection initialized successfully!');
      } catch (initError) {
        console.error('❌ Failed to initialize database connection:', initError.message);
        
        // Provide troubleshooting tips
        console.log('\n🔧 Troubleshooting Tips:');
        console.log('1. Make sure PostgreSQL is running');
        console.log('2. Check if the database exists');
        console.log('3. Verify connection credentials');
        console.log('4. Check if the port is accessible');
        
        console.log('\n🚀 Quick fixes:');
        console.log('- Start PostgreSQL: docker-compose up postgres -d');
        console.log('- Check logs: docker-compose logs postgres');
        console.log('- Create database manually if needed');
      }
    }
    
    await app.close();
    
  } catch (error) {
    console.error('❌ Failed to create application context:', error.message);
    
    console.log('\n🔧 Common Issues:');
    console.log('1. Environment variables not set');
    console.log('2. PostgreSQL service not running');
    console.log('3. Wrong database credentials');
    console.log('4. Network connectivity issues');
    
    console.log('\n📝 Environment Variables Check:');
    console.log('DB_HOST:', process.env.DB_HOST || 'Not set (default: localhost)');
    console.log('DB_PORT:', process.env.DB_PORT || 'Not set (default: 5432)');
    console.log('DB_USER:', process.env.DB_USER || 'Not set (default: postgres)');
    console.log('DB_PASS:', process.env.DB_PASS ? '***' : 'Not set (default: root)');
    console.log('DB_NAME:', process.env.DB_NAME || 'Not set (default: store_management_db)');
  }
}

testDatabaseConnection(); 