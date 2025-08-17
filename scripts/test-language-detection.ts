import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  console.log('🧪 Testing language detection and response generation...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('LanguageTest');
  
  try {
    // Get the AI agent service
    const aiAgentService = app.get('AiAgentService');
    
    // Test cases
    const testCases = [
      {
        query: 'how are you',
        expectedLanguage: 'English',
        description: 'English greeting'
      },
      {
        query: 'كيف حالك',
        expectedLanguage: 'Arabic',
        description: 'Arabic greeting'
      },
      {
        query: 'hello',
        expectedLanguage: 'English',
        description: 'English hello'
      },
      {
        query: 'مرحبا',
        expectedLanguage: 'Arabic',
        description: 'Arabic hello'
      },
      {
        query: 'show me all users',
        expectedLanguage: 'English',
        description: 'English business query'
      },
      {
        query: 'أرني جميع المستخدمين',
        expectedLanguage: 'Arabic',
        description: 'Arabic business query'
      }
    ];

    console.log('\n=== TESTING LANGUAGE DETECTION ===');
    
    for (const testCase of testCases) {
      console.log(`\n--- Testing: ${testCase.description} ---`);
      console.log(`Query: "${testCase.query}"`);
      console.log(`Expected Language: ${testCase.expectedLanguage}`);
      
      try {
        // Test the query
        const result = await aiAgentService.handleQuery(testCase.query, 'test-user-id');
        console.log(`✅ Response received (${result.message.length} characters)`);
        console.log(`Response preview: "${result.message.substring(0, 100)}..."`);
        
        // Check if response contains Arabic characters
        const arabicRegex = /[\u0600-\u06FF]/;
        const containsArabic = arabicRegex.test(result.message);
        
        if (testCase.expectedLanguage === 'Arabic' && containsArabic) {
          console.log('✅ Correctly responded in Arabic');
        } else if (testCase.expectedLanguage === 'English' && !containsArabic) {
          console.log('✅ Correctly responded in English');
        } else {
          console.log('⚠️  Language mismatch detected');
          console.log(`Expected: ${testCase.expectedLanguage}, Contains Arabic: ${containsArabic}`);
        }
        
      } catch (error) {
        console.error(`❌ Error testing query: ${error.message}`);
      }
    }

    console.log('\n✅ Language detection test completed!');

  } catch (error) {
    console.error('❌ Error during language detection test:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap(); 