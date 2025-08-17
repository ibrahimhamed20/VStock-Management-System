import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Logger } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

// Import entities
import { JournalEntry, JournalEntryLine } from '../src/accounting/entities/journal-entry.entity';
import { Account } from '../src/accounting/entities/account.entity';

async function bootstrap() {
  console.log('📊 Starting journal entries data insertion...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('JournalEntriesDataInserter');
  
  try {
    // Get repositories
    const journalEntryRepository = app.get(getRepositoryToken(JournalEntry));
    const journalEntryLineRepository = app.get(getRepositoryToken(JournalEntryLine));
    const accountRepository = app.get(getRepositoryToken(Account));

    // Helper function to convert Excel date to JavaScript Date
    const excelDateToDate = (excelDate: number): Date => {
      // Excel dates are days since 1900-01-01 (with some quirks)
      // Add 2 days to account for Excel's leap year bug
      const date = new Date(1900, 0, 1);
      date.setDate(date.getDate() + excelDate + 2);
      return date;
    };

    // =====================================================
    // 1. JOURNAL ENTRIES
    // =====================================================

    logger.log('Creating journal entries...');

    const journalEntriesData = [
      {
        code: 'je-1',
        date: excelDateToDate(45069), // March 1, 2025
        reference: 'CAP-001',
        description: 'Capital investment - Mostafa Ibrahem',
        lines: [
          { accountCode: 'ACC-16', amount: 91000.00, type: 'debit', description: 'Cash received from Mostafa Ibrahem' },
          { accountCode: 'ACC-211', amount: 91000.00, type: 'credit', description: 'Capital contribution from Mostafa Ibrahem' }
        ]
      },
      {
        code: 'je-2',
        date: excelDateToDate(45069), // March 1, 2025
        reference: 'CAP-002',
        description: 'Capital investment - Karim Ayman',
        lines: [
          { accountCode: 'ACC-16', amount: 91000.00, type: 'debit', description: 'Cash received from Karim Ayman' },
          { accountCode: 'ACC-212', amount: 91000.00, type: 'credit', description: 'Capital contribution from Karim Ayman' }
        ]
      },
      {
        code: 'je-3',
        date: excelDateToDate(45069), // March 1, 2025
        reference: 'CAP-003',
        description: 'Capital investment - Mohamed eladawy',
        lines: [
          { accountCode: 'ACC-16', amount: 91000.00, type: 'debit', description: 'Cash received from Mohamed eladawy' },
          { accountCode: 'ACC-213', amount: 91000.00, type: 'credit', description: 'Capital contribution from Mohamed eladawy' }
        ]
      },
      {
        code: 'je-4',
        date: excelDateToDate(45069), // March 1, 2025
        reference: 'RENT-001',
        description: 'March rental expense',
        lines: [
          { accountCode: 'ACC-532', amount: 1500.00, type: 'debit', description: 'March rental expense' },
          { accountCode: 'ACC-16', amount: 1500.00, type: 'credit', description: 'Cash paid for March rent' }
        ]
      },
      {
        code: 'je-5',
        date: excelDateToDate(45069), // March 1, 2025
        reference: 'PREPAID-001',
        description: 'Two months rental insurance',
        lines: [
          { accountCode: 'ACC-17', amount: 3000.00, type: 'debit', description: 'Two months rental insurance prepaid' },
          { accountCode: 'ACC-16', amount: 3000.00, type: 'credit', description: 'Cash paid for rental insurance' }
        ]
      },
      {
        code: 'je-6',
        date: excelDateToDate(45069), // March 1, 2025
        reference: 'OTHER-001',
        description: 'Commission for broker',
        lines: [
          { accountCode: 'ACC-534', amount: 1500.00, type: 'debit', description: 'Commission for broker' },
          { accountCode: 'ACC-16', amount: 1500.00, type: 'credit', description: 'Cash paid for broker commission' }
        ]
      },
      {
        code: 'je-7',
        date: excelDateToDate(45069), // March 1, 2025
        reference: 'CAPEX-001',
        description: 'Bought fridge',
        lines: [
          { accountCode: 'ACC-111', amount: 195000.00, type: 'debit', description: 'Fridge purchased' },
          { accountCode: 'ACC-16', amount: 195000.00, type: 'credit', description: 'Cash paid for fridge' }
        ]
      },
      {
        code: 'je-8',
        date: excelDateToDate(45085), // April 16, 2025
        reference: 'RENT-002',
        description: 'April rent',
        lines: [
          { accountCode: 'ACC-532', amount: 1500.00, type: 'debit', description: 'April rental expense' },
          { accountCode: 'ACC-16', amount: 1500.00, type: 'credit', description: 'Cash paid for April rent' }
        ]
      },
      {
        code: 'je-9',
        date: excelDateToDate(45078), // April 9, 2025
        reference: 'INV-001',
        description: 'Bought goods class A',
        lines: [
          { accountCode: 'ACC-141', amount: 39500.00, type: 'debit', description: 'Inventory purchased - Class A' },
          { accountCode: 'ACC-16', amount: 39500.00, type: 'credit', description: 'Cash paid for Class A inventory' }
        ]
      },
      {
        code: 'je-10',
        date: excelDateToDate(45078), // April 9, 2025
        reference: 'INV-002',
        description: 'Bought goods class B',
        lines: [
          { accountCode: 'ACC-142', amount: 31000.00, type: 'debit', description: 'Inventory purchased - Class B' },
          { accountCode: 'ACC-16', amount: 31000.00, type: 'credit', description: 'Cash paid for Class B inventory' }
        ]
      },
      {
        code: 'je-11',
        date: excelDateToDate(45084), // April 15, 2025
        reference: 'SALE-891',
        description: 'Sale to Hart Attack - Class A',
        lines: [
          { accountCode: 'ACC-16', amount: 1040.00, type: 'debit', description: 'Cash received from Hart Attack' },
          { accountCode: 'ACC-511', amount: 1040.00, type: 'credit', description: 'Sales revenue - Class A to Hart Attack' }
        ]
      },
      {
        code: 'je-12',
        date: excelDateToDate(45084), // April 15, 2025
        reference: 'SALE-892',
        description: 'Sale to City Crepe - Class A',
        lines: [
          { accountCode: 'ACC-16', amount: 520.00, type: 'debit', description: 'Cash received from City Crepe' },
          { accountCode: 'ACC-511', amount: 520.00, type: 'credit', description: 'Sales revenue - Class A to City Crepe' }
        ]
      },
      {
        code: 'je-13',
        date: excelDateToDate(45084), // April 15, 2025
        reference: 'SALE-893',
        description: 'Sale to Minzu Restaurant - Class B',
        lines: [
          { accountCode: 'ACC-16', amount: 450.00, type: 'debit', description: 'Cash received from Minzu Restaurant' },
          { accountCode: 'ACC-512', amount: 450.00, type: 'credit', description: 'Sales revenue - Class B to Minzu Restaurant' }
        ]
      },
      {
        code: 'je-14',
        date: excelDateToDate(45085), // April 16, 2025
        reference: 'SALE-894',
        description: 'Sale to Samra Restaurant - Class A',
        lines: [
          { accountCode: 'ACC-16', amount: 1040.00, type: 'debit', description: 'Cash received from Samra Restaurant' },
          { accountCode: 'ACC-511', amount: 1040.00, type: 'credit', description: 'Sales revenue - Class A to Samra Restaurant' }
        ]
      },
      {
        code: 'je-15',
        date: excelDateToDate(45085), // April 16, 2025
        reference: 'SALE-895',
        description: 'Sale to Dodge Restaurant - Class A',
        lines: [
          { accountCode: 'ACC-16', amount: 520.00, type: 'debit', description: 'Cash received from Dodge Restaurant' },
          { accountCode: 'ACC-511', amount: 520.00, type: 'credit', description: 'Sales revenue - Class A to Dodge Restaurant' }
        ]
      }
    ];

    const createdJournalEntries: JournalEntry[] = [];

    for (const entryData of journalEntriesData) {
      // Check if journal entry already exists
      const existingEntry = await journalEntryRepository.findOne({
        where: { code: entryData.code }
      });

      if (existingEntry) {
        logger.log(`Journal entry ${entryData.code} already exists, skipping...`);
        createdJournalEntries.push(existingEntry);
        continue;
      }

      // Create journal entry
      const journalEntry = journalEntryRepository.create({
        code: entryData.code,
        date: entryData.date,
        reference: entryData.reference,
        description: entryData.description
      });

      const savedEntry = await journalEntryRepository.save(journalEntry);
      createdJournalEntries.push(savedEntry);
      logger.log(`Created journal entry: ${entryData.code} (${entryData.reference})`);

      // Create journal entry lines
      for (const lineData of entryData.lines) {
        // Get account
        const account = await accountRepository.findOne({
          where: { code: lineData.accountCode }
        });

        if (!account) {
          logger.warn(`Account ${lineData.accountCode} not found, skipping line...`);
          continue;
        }

        // Create journal entry line
        const journalEntryLine = journalEntryLineRepository.create({
          journalEntryId: savedEntry.id,
          accountId: account.id,
          amount: lineData.amount,
          type: lineData.type as 'debit' | 'credit',
          description: lineData.description
        });

        await journalEntryLineRepository.save(journalEntryLine);
        logger.log(`Created journal entry line: ${lineData.type} ${lineData.amount} EGP to ${account.name}`);
      }
    }

    // =====================================================
    // 2. VERIFICATION
    // =====================================================

    logger.log('Verifying inserted data...');

    const journalEntryCount = await journalEntryRepository.count({
      where: { code: { like: 'je-%' } }
    });

    const journalEntryLineCount = await journalEntryLineRepository
      .createQueryBuilder('jel')
      .innerJoin('jel.journalEntry', 'je')
      .where('je.code LIKE :pattern', { pattern: 'je-%' })
      .getCount();

    const totalDebits = await journalEntryLineRepository
      .createQueryBuilder('jel')
      .innerJoin('jel.journalEntry', 'je')
      .where('je.code LIKE :pattern', { pattern: 'je-%' })
      .andWhere('jel.type = :type', { type: 'debit' })
      .select('SUM(jel.amount)', 'total')
      .getRawOne();

    const totalCredits = await journalEntryLineRepository
      .createQueryBuilder('jel')
      .innerJoin('jel.journalEntry', 'je')
      .where('je.code LIKE :pattern', { pattern: 'je-%' })
      .andWhere('jel.type = :type', { type: 'credit' })
      .select('SUM(jel.amount)', 'total')
      .getRawOne();

    console.log('\n=== JOURNAL ENTRIES DATA INSERTION SUMMARY ===');
    console.table([
      { Metric: 'Journal Entries Created', Value: journalEntryCount },
      { Metric: 'Journal Entry Lines Created', Value: journalEntryLineCount },
      { Metric: 'Total Debits (EGP)', Value: parseFloat(totalDebits?.total || '0').toFixed(2) },
      { Metric: 'Total Credits (EGP)', Value: parseFloat(totalCredits?.total || '0').toFixed(2) }
    ]);

    console.log('\n✅ Journal entries data insertion completed successfully!');
    console.log('\n📋 Journal Entries Summary:');
    console.log('1. Capital investments (3 entries): 273,000 EGP total');
    console.log('2. Rent expenses (2 entries): 3,000 EGP total');
    console.log('3. Prepaid expenses (1 entry): 3,000 EGP');
    console.log('4. Other expenses (1 entry): 1,500 EGP');
    console.log('5. Fixed assets (1 entry): 195,000 EGP');
    console.log('6. Inventory purchases (2 entries): 70,500 EGP total');
    console.log('7. Sales transactions (5 entries): 3,570 EGP total');
    console.log(`Total: ${parseFloat(totalDebits?.total || '0').toFixed(2)} EGP in journal entries`);

  } catch (error) {
    console.error('❌ Error during journal entries data insertion:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap(); 