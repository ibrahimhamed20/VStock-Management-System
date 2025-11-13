import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, AccountType } from './entities/account.entity';
import { JournalEntry, JournalEntryLine } from './entities/journal-entry.entity';
import { CreateJournalEntryDto } from './dtos/journal-entry.dto';
import { UpdateJournalEntryDto } from './dtos/update-journal-entry.dto';

@Injectable()
export class AccountingService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(JournalEntry)
    private readonly journalEntryRepo: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private readonly journalEntryLineRepo: Repository<JournalEntryLine>,
  ) { }

  // Chart of Accounts Tree
  async getAccountsTree() {
    const accounts = await this.accountRepo.find({
      relations: ['parent', 'children'],
    });
    // Build tree structure
    const map = new Map<string, (Account & { children: any[] })>(accounts.map((a) => [a.id, { ...a, children: [] }]));
    const roots: (Account & { children: any[] })[] = [];
    for (const acc of accounts) {
      if (acc.parent) {
        const parent = map.get(acc.parent.id);
        const child = map.get(acc.id);
        if (parent && child) {
          parent.children.push(child);
        }
      } else {
        const root = map.get(acc.id);
        if (root) {
          roots.push(root);
        }
      }
    }
    return roots;
  }

  async createAccount(body: any) {
    const { code, name, type, parentId } = body;
    if (!code || !name || !type)
      throw new BadRequestException('Missing required fields');
    if (!Object.values(AccountType).includes(type))
      throw new BadRequestException('Invalid account type');
    let parent: Account | undefined = undefined;
    if (parentId) {
      const foundParent = await this.accountRepo.findOne({ where: { id: parentId } });
      if (!foundParent) throw new NotFoundException('Parent account not found');
      parent = foundParent;
    }
    const account = this.accountRepo.create({ code, name, type, parent });
    return this.accountRepo.save(account);
  }

  async getAccountById(id: string) {
    const account = await this.accountRepo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async updateAccount(id: string, body: any) {
    const account = await this.accountRepo.findOne({ where: { id } });
    if (!account) throw new NotFoundException('Account not found');

    const { code, name, type, parentId } = body;
    
    if (code !== undefined) account.code = code;
    if (name !== undefined) account.name = name;
    if (type !== undefined) {
      if (!Object.values(AccountType).includes(type))
        throw new BadRequestException('Invalid account type');
      account.type = type;
    }
    
    if (parentId !== undefined) {
      if (parentId === null) {
        account.parent = null;
      } else {
        const foundParent = await this.accountRepo.findOne({ where: { id: parentId } });
        if (!foundParent) throw new NotFoundException('Parent account not found');
        if (foundParent.id === id) throw new BadRequestException('Account cannot be its own parent');
        account.parent = foundParent;
      }
    }

    return this.accountRepo.save(account);
  }

  async deleteAccount(id: string) {
    const account = await this.accountRepo.findOne({
      where: { id },
      relations: ['children', 'journalEntryLines'],
    });
    if (!account) throw new NotFoundException('Account not found');

    // Check if account has children
    if (account.children && account.children.length > 0) {
      throw new BadRequestException('Cannot delete account with child accounts');
    }

    // Check if account has journal entries
    if (account.journalEntryLines && account.journalEntryLines.length > 0) {
      throw new BadRequestException('Cannot delete account with journal entries');
    }

    await this.accountRepo.remove(account);
    return { message: 'Account deleted successfully' };
  }

  // Journal Entries
  async getJournalEntries(accountId?: string, startDate?: string, endDate?: string) {
    let qb = this.journalEntryRepo
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.lines', 'line')
      .leftJoinAndSelect('line.account', 'account');

    if (accountId) {
      qb = qb.where('line.accountId = :accountId', { accountId });
    }

    if (startDate) {
      qb = qb.andWhere('entry.date >= :startDate', { startDate });
    }

    if (endDate) {
      qb = qb.andWhere('entry.date <= :endDate', { endDate });
    }

    return qb.orderBy('entry.date', 'DESC').getMany();
  }

  async getJournalEntryById(id: string) {
    const entry = await this.journalEntryRepo.findOne({
      where: { id },
      relations: ['lines', 'lines.account'],
    });
    if (!entry) throw new NotFoundException('Journal entry not found');
    return entry;
  }

  async createJournalEntry(dto: CreateJournalEntryDto) {
    // Validate double-entry
    const debitTotal = dto.lines
      .filter((l) => l.type === 'debit')
      .reduce((sum, l) => sum + l.amount, 0);
    const creditTotal = dto.lines
      .filter((l) => l.type === 'credit')
      .reduce((sum, l) => sum + l.amount, 0);
    if (debitTotal !== creditTotal)
      throw new BadRequestException('Debits and credits must be equal');
    // Validate accounts
    for (const line of dto.lines) {
      const acc = await this.accountRepo.findOne({
        where: { id: line.accountId },
      });
      if (!acc)
        throw new NotFoundException(`Account not found: ${line.accountId}`);
    }
    // Create entry and lines
    const entry = this.journalEntryRepo.create({
      date: dto.date,
      reference: dto.reference,
      description: dto.description,
      lines: dto.lines.map((l) => this.journalEntryLineRepo.create(l)),
    });
    const saved = await this.journalEntryRepo.save(entry);
    
    // Reload with relations to get account info
    const savedWithRelations = await this.journalEntryRepo.findOne({
      where: { id: saved.id },
      relations: ['lines', 'lines.account'],
    });
    
    // Update account balances
    if (savedWithRelations) {
      for (const line of savedWithRelations.lines) {
        const acc = await this.accountRepo.findOne({
          where: { id: line.account.id },
        });
        if (!acc) continue;
        if (line.type === 'debit') acc.balance += Number(line.amount);
        else acc.balance -= Number(line.amount);
        await this.accountRepo.save(acc);
      }
      return savedWithRelations;
    }
    return saved;
  }

  async updateJournalEntry(id: string, dto: UpdateJournalEntryDto) {
    const entry = await this.journalEntryRepo.findOne({
      where: { id },
      relations: ['lines', 'lines.account'],
    });
    if (!entry) throw new NotFoundException('Journal entry not found');

    // If lines are being updated, validate double-entry
    if (dto.lines && dto.lines.length > 0) {
      const debitTotal = dto.lines
        .filter((l) => l.type === 'debit')
        .reduce((sum, l) => sum + l.amount, 0);
      const creditTotal = dto.lines
        .filter((l) => l.type === 'credit')
        .reduce((sum, l) => sum + l.amount, 0);
      if (debitTotal !== creditTotal)
        throw new BadRequestException('Debits and credits must be equal');

      // Revert old account balances
      for (const line of entry.lines) {
        const acc = await this.accountRepo.findOne({
          where: { id: line.account.id },
        });
        if (!acc) continue;
        if (line.type === 'debit') acc.balance -= Number(line.amount);
        else acc.balance += Number(line.amount);
        await this.accountRepo.save(acc);
      }

      // Delete old lines
      await this.journalEntryLineRepo.remove(entry.lines);

      // Validate new accounts
      for (const line of dto.lines) {
        const acc = await this.accountRepo.findOne({
          where: { id: line.accountId },
        });
        if (!acc)
          throw new NotFoundException(`Account not found: ${line.accountId}`);
      }

      // Create new lines
      entry.lines = dto.lines.map((l) => this.journalEntryLineRepo.create(l));
    }

    // Update entry fields
    if (dto.date !== undefined) entry.date = dto.date;
    if (dto.reference !== undefined) entry.reference = dto.reference;
    if (dto.description !== undefined) entry.description = dto.description;

    const saved = await this.journalEntryRepo.save(entry);

    // Update account balances with new lines
    if (dto.lines && dto.lines.length > 0) {
      // Reload with relations to get account info
      const savedWithRelations = await this.journalEntryRepo.findOne({
        where: { id: saved.id },
        relations: ['lines', 'lines.account'],
      });
      
      if (savedWithRelations) {
        for (const line of savedWithRelations.lines) {
          const acc = await this.accountRepo.findOne({
            where: { id: line.account.id },
          });
          if (!acc) continue;
          if (line.type === 'debit') acc.balance += Number(line.amount);
          else acc.balance -= Number(line.amount);
          await this.accountRepo.save(acc);
        }
        return savedWithRelations;
      }
    }

    return saved;
  }

  async deleteJournalEntry(id: string) {
    const entry = await this.journalEntryRepo.findOne({
      where: { id },
      relations: ['lines', 'lines.account'],
    });
    if (!entry) throw new NotFoundException('Journal entry not found');

    // Revert account balances
    for (const line of entry.lines) {
      const acc = await this.accountRepo.findOne({
        where: { id: line.account.id },
      });
      if (!acc) continue;
      if (line.type === 'debit') acc.balance -= Number(line.amount);
      else acc.balance += Number(line.amount);
      await this.accountRepo.save(acc);
    }

    await this.journalEntryRepo.remove(entry);
    return { message: 'Journal entry deleted successfully' };
  }

  // General Ledger
  async getGeneralLedger(accountId?: string) {
    if (!accountId) throw new BadRequestException('accountId required');
    const account = await this.accountRepo.findOne({
      where: { id: accountId },
    });
    if (!account) throw new NotFoundException('Account not found');
    const entries = await this.journalEntryRepo
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.lines', 'line')
      .where('line.accountId = :accountId', { accountId })
      .orderBy('entry.date', 'ASC')
      .getMany();
    return { account, entries };
  }

  // Trial Balance
  async getTrialBalance() {
    const accounts = await this.accountRepo.find();
    const summary = accounts.map((a) => ({
      code: a.code,
      name: a.name,
      type: a.type,
      balance: a.balance,
    }));
    const totalDebits = summary
      .filter((a) => [AccountType.ASSET, AccountType.EXPENSE].includes(a.type))
      .reduce((sum, a) => sum + Number(a.balance), 0);
    const totalCredits = summary
      .filter((a) =>
        [
          AccountType.LIABILITY,
          AccountType.EQUITY,
          AccountType.REVENUE,
        ].includes(a.type),
      )
      .reduce((sum, a) => sum + Number(a.balance), 0);
    return { summary, totalDebits, totalCredits };
  }

  // Get all journal entries within a date range (inclusive)
  async getJournalEntriesByDateRange(startDate?: string, endDate?: string) {
    let qb = this.journalEntryRepo
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.lines', 'line')
      .leftJoinAndSelect('line.account', 'account');
    if (startDate) {
      qb = qb.andWhere('entry.date >= :startDate', { startDate });
    }
    if (endDate) {
      qb = qb.andWhere('entry.date <= :endDate', { endDate });
    }
    return qb.orderBy('entry.date', 'ASC').getMany();
  }

  async getLedgers() {
    return this.accountRepo.find({
      order: { code: 'ASC' },
    });
  }

  async getBalances() {
    return this.accountRepo.find({
      select: ['id', 'code', 'name', 'balance', 'updatedAt'],
      order: { code: 'ASC' },
    });
  }

  // Financial Reports
  async getBalanceSheet(startDate?: string, endDate?: string) {
    const accounts = await this.accountRepo.find();
    
    // Filter accounts by date range if provided
    let filteredAccounts = accounts;
    if (startDate || endDate) {
      // Get journal entries in date range
      const entries = await this.getJournalEntriesByDateRange(startDate, endDate);
      const accountIds = new Set<string>();
      entries.forEach(entry => {
        entry.lines.forEach(line => {
          if (line.account && line.account.id) {
            accountIds.add(line.account.id);
          }
        });
      });
      filteredAccounts = accounts.filter(acc => accountIds.has(acc.id));
    }

    const assets = filteredAccounts
      .filter(a => a.type === AccountType.ASSET)
      .map(a => ({
        code: a.code,
        name: a.name,
        balance: Number(a.balance),
      }))
      .sort((a, b) => a.code.localeCompare(b.code));

    const liabilities = filteredAccounts
      .filter(a => a.type === AccountType.LIABILITY)
      .map(a => ({
        code: a.code,
        name: a.name,
        balance: Number(a.balance),
      }))
      .sort((a, b) => a.code.localeCompare(b.code));

    const equity = filteredAccounts
      .filter(a => a.type === AccountType.EQUITY)
      .map(a => ({
        code: a.code,
        name: a.name,
        balance: Number(a.balance),
      }))
      .sort((a, b) => a.code.localeCompare(b.code));

    const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.balance, 0);
    const totalEquity = equity.reduce((sum, e) => sum + e.balance, 0);
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    return {
      assets,
      liabilities,
      equity,
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalLiabilitiesAndEquity,
      isBalanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01,
      asOfDate: endDate || new Date().toISOString().split('T')[0],
    };
  }

  async getIncomeStatement(startDate?: string, endDate?: string) {
    const accounts = await this.accountRepo.find();
    
    // Filter accounts by date range if provided
    let filteredAccounts = accounts;
    if (startDate || endDate) {
      const entries = await this.getJournalEntriesByDateRange(startDate, endDate);
      const accountIds = new Set<string>();
      entries.forEach(entry => {
        entry.lines.forEach(line => {
          if (line.account && line.account.id) {
            accountIds.add(line.account.id);
          }
        });
      });
      filteredAccounts = accounts.filter(acc => accountIds.has(acc.id));
    }

    const revenue = filteredAccounts
      .filter(a => a.type === AccountType.REVENUE)
      .map(a => ({
        code: a.code,
        name: a.name,
        balance: Number(a.balance),
      }))
      .sort((a, b) => a.code.localeCompare(b.code));

    const expenses = filteredAccounts
      .filter(a => a.type === AccountType.EXPENSE)
      .map(a => ({
        code: a.code,
        name: a.name,
        balance: Number(a.balance),
      }))
      .sort((a, b) => a.code.localeCompare(b.code));

    const totalRevenue = revenue.reduce((sum, r) => sum + r.balance, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.balance, 0);
    const netIncome = totalRevenue - totalExpenses;

    return {
      revenue,
      expenses,
      totalRevenue,
      totalExpenses,
      netIncome,
      period: {
        startDate: startDate || null,
        endDate: endDate || new Date().toISOString().split('T')[0],
      },
    };
  }

  async getCashFlowStatement(startDate?: string, endDate?: string) {
    const accounts = await this.accountRepo.find();
    
    // Get cash accounts (typically asset accounts with "cash" in name or code)
    const cashAccounts = accounts.filter(
      a => a.type === AccountType.ASSET && 
      (a.name.toLowerCase().includes('cash') || 
       a.code.toLowerCase().includes('cash') ||
       a.name.toLowerCase().includes('bank'))
    );

    if (cashAccounts.length === 0) {
      // Return empty statement if no cash accounts found
      return {
        operatingActivities: [],
        investingActivities: [],
        financingActivities: [],
        operatingCashFlow: 0,
        investingCashFlow: 0,
        financingCashFlow: 0,
        netCashFlow: 0,
        beginningCash: 0,
        endingCash: 0,
        period: {
          startDate: startDate || null,
          endDate: endDate || new Date().toISOString().split('T')[0],
        },
      };
    }

    const cashAccountIds = new Set(cashAccounts.map(ca => ca.id));

    // Get all journal entries in date range
    const entries = await this.getJournalEntriesByDateRange(startDate, endDate);
    
    // Calculate cash flow from operations, investing, and financing
    const operatingActivities: Array<{ description: string; amount: number; type: 'inflow' | 'outflow' }> = [];
    let operatingCashFlow = 0;

    const investingActivities: Array<{ description: string; amount: number; type: 'inflow' | 'outflow' }> = [];
    let investingCashFlow = 0;

    const financingActivities: Array<{ description: string; amount: number; type: 'inflow' | 'outflow' }> = [];
    let financingCashFlow = 0;

    // Process entries that affect cash accounts
    entries.forEach(entry => {
      entry.lines.forEach(line => {
        if (!line.account || !line.account.id) return;
        
        const affectsCash = cashAccountIds.has(line.account.id);
        const otherLine = entry.lines.find(l => l.id !== line.id && l.account && l.account.id);
        
        if (affectsCash && otherLine && otherLine.account) {
          const amount = Number(line.amount);
          const isInflow = line.type === 'debit';
          const otherAccount = otherLine.account;
          
          // Categorize based on the other account in the entry
          if (otherAccount.type === AccountType.REVENUE) {
            // Revenue -> Operating (inflow)
            operatingActivities.push({
              description: entry.description || entry.reference || `Revenue: ${otherAccount.name}`,
              amount,
              type: 'inflow',
            });
            operatingCashFlow += amount;
          } else if (otherAccount.type === AccountType.EXPENSE) {
            // Expense -> Operating (outflow)
            operatingActivities.push({
              description: entry.description || entry.reference || `Expense: ${otherAccount.name}`,
              amount,
              type: 'outflow',
            });
            operatingCashFlow -= amount;
          } else if (otherAccount.type === AccountType.ASSET && !cashAccountIds.has(otherAccount.id)) {
            // Other assets -> Investing
            investingActivities.push({
              description: entry.description || entry.reference || `Asset: ${otherAccount.name}`,
              amount,
              type: isInflow ? 'outflow' : 'inflow',
            });
            investingCashFlow += isInflow ? -amount : amount;
          } else if (otherAccount.type === AccountType.LIABILITY || otherAccount.type === AccountType.EQUITY) {
            // Liabilities/Equity -> Financing
            financingActivities.push({
              description: entry.description || entry.reference || `${otherAccount.type}: ${otherAccount.name}`,
              amount,
              type: isInflow ? 'inflow' : 'outflow',
            });
            financingCashFlow += isInflow ? amount : -amount;
          }
        }
      });
    });

    const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;

    // Calculate beginning cash (balance before start date)
    let beginningCash = 0;
    if (startDate) {
      const entriesBefore = await this.getJournalEntriesByDateRange(undefined, startDate);
      cashAccounts.forEach(acc => {
        let balance = 0;
        entriesBefore.forEach(entry => {
          entry.lines.forEach(line => {
            if (line.account && line.account.id === acc.id) {
              if (line.type === 'debit') balance += Number(line.amount);
              else balance -= Number(line.amount);
            }
          });
        });
        beginningCash += balance;
      });
    } else {
      // No start date - beginning cash is current balance minus net flow
      beginningCash = cashAccounts.reduce((sum, acc) => sum + Number(acc.balance), 0) - netCashFlow;
    }

    const endingCash = beginningCash + netCashFlow;

    return {
      operatingActivities,
      investingActivities,
      financingActivities,
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      netCashFlow,
      beginningCash,
      endingCash,
      period: {
        startDate: startDate || null,
        endDate: endDate || new Date().toISOString().split('T')[0],
      },
    };
  }

  // Account Reconciliation
  async reconcileAccount(accountId: string, statementBalance: number, statementDate: string) {
    const account = await this.accountRepo.findOne({
      where: { id: accountId },
    });
    if (!account) throw new NotFoundException('Account not found');

    const bookBalance = Number(account.balance);
    const difference = statementBalance - bookBalance;

    // Get all journal entries for this account up to statement date
    const entries = await this.journalEntryRepo
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.lines', 'line')
      .leftJoinAndSelect('line.account', 'account')
      .where('line.accountId = :accountId', { accountId })
      .andWhere('entry.date <= :statementDate', { statementDate })
      .orderBy('entry.date', 'ASC')
      .getMany();

    return {
      account: {
        id: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
      },
      statementBalance,
      bookBalance,
      difference,
      entries,
      reconciled: Math.abs(difference) < 0.01,
      statementDate,
      reconciledAt: new Date().toISOString(),
    };
  }
}
