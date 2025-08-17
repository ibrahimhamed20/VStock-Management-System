import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Logger } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

// Import entities
import { Account } from '../src/accounting/entities/account.entity';
import { JournalEntry, JournalEntryLine } from '../src/accounting/entities/journal-entry.entity';

async function bootstrap() {
  console.log('💰 Starting account balances update...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('AccountBalancesUpdater');

  try {
    // Get repositories
    const accountRepository = app.get(getRepositoryToken(Account));
    const journalEntryLineRepository = app.get(getRepositoryToken(JournalEntryLine));

    // =====================================================
    // 1. CALCULATE ACCOUNT BALANCES FROM JOURNAL ENTRIES
    // =====================================================

    logger.log('Calculating account balances from journal entries...');

    // Get all journal entry lines with their accounts
    const journalEntryLines = await journalEntryLineRepository
      .createQueryBuilder('jel')
      .innerJoin('jel.journalEntry', 'je')
      .innerJoin('jel.account', 'account')
      .where('je.code LIKE :pattern', { pattern: 'je-%' })
      .select([
        'jel.amount',
        'jel.type',
        'account.id',
        'account.code',
        'account.name',
        'account.type'
      ])
      .getRawMany();

    // Calculate balances for each account
    const accountBalances = new Map<string, number>();

    for (const line of journalEntryLines) {
      const accountId = line.account_id;
      const currentBalance = accountBalances.get(accountId) || 0;

      if (line.jel_type === 'debit') {
        accountBalances.set(accountId, currentBalance + parseFloat(line.jel_amount));
      } else if (line.jel_type === 'credit') {
        accountBalances.set(accountId, currentBalance - parseFloat(line.jel_amount));
      }
    }

    // =====================================================
    // 2. UPDATE ACCOUNT BALANCES
    // =====================================================

    logger.log('Updating account balances...');

    const accounts = await accountRepository.find();
    let updatedCount = 0;

    for (const account of accounts) {
      const newBalance = accountBalances.get(account.id) || 0;

      if (account.balance !== newBalance) {
        account.balance = newBalance;
        await accountRepository.save(account);
        updatedCount++;
        logger.log(`Updated ${account.code} (${account.name}): ${account.balance} EGP`);
      }
    }

    // =====================================================
    // 3. VERIFICATION AND REPORTING
    // =====================================================

    logger.log('Generating balance report...');

    // Get updated accounts with balances
    const accountsWithBalances = await accountRepository.find({
      where: { balance: { not: 0 } },
      order: { code: 'ASC' }
    });

    // Calculate totals by account type
    const totalsByType = accountsWithBalances.reduce((acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = { count: 0, total: 0 };
      }
      acc[account.type].count++;
      acc[account.type].total += account.balance;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    // Calculate trial balance
    const totalDebits = accountsWithBalances
      .filter(a => a.type === 'asset' || a.type === 'expense')
      .reduce((sum, a) => sum + a.balance, 0);

    const totalCredits = Math.abs(accountsWithBalances
      .filter(a => a.type === 'liability' || a.type === 'equity' || a.type === 'revenue')
      .reduce((sum, a) => sum + a.balance, 0));

    // Calculate net income
    const revenue = Math.abs(accountsWithBalances
      .filter(a => a.type === 'revenue')
      .reduce((sum, a) => sum + a.balance, 0));

    const expenses = accountsWithBalances
      .filter(a => a.type === 'expense')
      .reduce((sum, a) => sum + a.balance, 0);

    const netIncome = revenue - expenses;

    // =====================================================
    // 4. OUTPUT RESULTS
    // =====================================================

    console.log('\n=== ACCOUNT BALANCES UPDATE SUMMARY ===');
    console.table([
      { Metric: 'Accounts Updated', Value: updatedCount },
      { Metric: 'Accounts with Non-Zero Balance', Value: accountsWithBalances.length },
      { Metric: 'Total Debits', Value: totalDebits.toFixed(2) + ' EGP' },
      { Metric: 'Total Credits', Value: totalCredits.toFixed(2) + ' EGP' },
      { Metric: 'Trial Balance Difference', Value: (totalDebits - totalCredits).toFixed(2) + ' EGP' }
    ]);

    console.log('\n=== BALANCE BY ACCOUNT TYPE ===');
    Object.entries(totalsByType).forEach(([type, data]: [string, { count: number; total: number }]) => {
      console.log(`${type.toUpperCase()}: ${data.count} accounts, ${data.total.toFixed(2)} EGP total`);
    });

    console.log('\n=== BALANCE SHEET SUMMARY ===');
    const assets = totalsByType['asset']?.total || 0;
    const liabilities = Math.abs(totalsByType['liability']?.total || 0);
    const equity = Math.abs(totalsByType['equity']?.total || 0);

    console.table([
      { Category: 'Assets', Amount: assets.toFixed(2) + ' EGP' },
      { Category: 'Liabilities', Amount: liabilities.toFixed(2) + ' EGP' },
      { Category: 'Equity', Amount: equity.toFixed(2) + ' EGP' },
      { Category: 'Total Liabilities + Equity', Amount: (liabilities + equity).toFixed(2) + ' EGP' }
    ]);

    console.log('\n=== INCOME STATEMENT SUMMARY ===');
    console.table([
      { Category: 'Revenue', Amount: revenue.toFixed(2) + ' EGP' },
      { Category: 'Expenses', Amount: expenses.toFixed(2) + ' EGP' },
      { Category: 'Net Income', Amount: netIncome.toFixed(2) + ' EGP' }
    ]);

    console.log('\n=== DETAILED ACCOUNT BALANCES ===');
    accountsWithBalances.forEach(account => {
      const balanceDirection = account.balance > 0 ? 'Debit' : 'Credit';
      const balanceStatus =
        (account.type === 'asset' && account.balance > 0) ||
          (account.type === 'liability' && account.balance < 0) ||
          (account.type === 'equity' && account.balance < 0) ||
          (account.type === 'revenue' && account.balance < 0) ||
          (account.type === 'expense' && account.balance > 0)
          ? 'Normal' : 'Check';

      console.log(`${account.code} | ${account.name} | ${account.balance.toFixed(2)} EGP | ${balanceDirection} | ${balanceStatus}`);
    });

    console.log('\n✅ Account balances update completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Updated ${updatedCount} account balances`);
    console.log(`- Trial balance: ${totalDebits.toFixed(2)} EGP debits = ${totalCredits.toFixed(2)} EGP credits`);
    console.log(`- Net income: ${netIncome.toFixed(2)} EGP`);
    console.log(`- Total assets: ${assets.toFixed(2)} EGP`);

  } catch (error) {
    console.error('❌ Error during account balances update:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap(); 