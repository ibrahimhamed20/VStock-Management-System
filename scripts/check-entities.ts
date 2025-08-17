import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Logger } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

// Import entities
import { Account } from '../src/accounting/entities/account.entity';
import { JournalEntry, JournalEntryLine } from '../src/accounting/entities/journal-entry.entity';

async function bootstrap() {
  console.log('🔍 Checking database entities...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('EntityChecker');
  
  try {
    // Get repositories
    const accountRepository = app.get(getRepositoryToken(Account));
    const journalEntryRepository = app.get(getRepositoryToken(JournalEntry));
    const journalEntryLineRepository = app.get(getRepositoryToken(JournalEntryLine));

    // Check accounts
    console.log('\n=== ACCOUNTS ===');
    const accounts = await accountRepository.find();
    console.log(`Total accounts: ${accounts.length}`);
    
    if (accounts.length > 0) {
      console.log('Sample accounts:');
      accounts.slice(0, 5).forEach(account => {
        console.log(`  ${account.code} - ${account.name} (${account.type}) - Balance: ${account.balance}`);
      });
    }

    // Check journal entries
    console.log('\n=== JOURNAL ENTRIES ===');
    const journalEntries = await journalEntryRepository.find();
    console.log(`Total journal entries: ${journalEntries.length}`);
    
    if (journalEntries.length > 0) {
      console.log('Sample journal entries:');
      journalEntries.slice(0, 3).forEach(entry => {
        console.log(`  ${entry.code} - ${entry.reference} - ${entry.description}`);
      });
    }

    // Check journal entry lines
    console.log('\n=== JOURNAL ENTRY LINES ===');
    const journalEntryLines = await journalEntryLineRepository.find();
    console.log(`Total journal entry lines: ${journalEntryLines.length}`);
    
    if (journalEntryLines.length > 0) {
      console.log('Sample journal entry lines:');
      journalEntryLines.slice(0, 5).forEach(line => {
        console.log(`  ${line.type} ${line.amount} EGP - Account: ${line.accountId}`);
      });
    }

    // Check for specific account codes we need
    console.log('\n=== REQUIRED ACCOUNT CODES ===');
    const requiredCodes = [
      'ACC-16', 'ACC-211', 'ACC-212', 'ACC-213', 'ACC-532', 
      'ACC-17', 'ACC-534', 'ACC-111', 'ACC-141', 'ACC-142',
      'ACC-511', 'ACC-512'
    ];
    
    for (const code of requiredCodes) {
      const account = await accountRepository.findOne({ where: { code } });
      if (account) {
        console.log(`✅ ${code} - ${account.name}`);
      } else {
        console.log(`❌ ${code} - NOT FOUND`);
      }
    }

    console.log('\n✅ Entity check completed!');

  } catch (error) {
    console.error('❌ Error during entity check:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap(); 