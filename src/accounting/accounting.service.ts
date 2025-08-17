import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, AccountType } from './entities/account.entity';
import { JournalEntry, JournalEntryLine } from './entities/journal-entry.entity';
import { CreateJournalEntryDto } from './dtos/journal-entry.dto';

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

  // Journal Entries
  async getJournalEntries(accountId?: string) {
    if (accountId) {
      return this.journalEntryRepo
        .createQueryBuilder('entry')
        .leftJoinAndSelect('entry.lines', 'line')
        .where('line.accountId = :accountId', { accountId })
        .getMany();
    }
    return this.journalEntryRepo.find({ relations: ['lines'] });
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
    // Update account balances
    for (const line of saved.lines) {
      const acc = await this.accountRepo.findOne({
        where: { id: line.account.id },
      });
      if (!acc) continue;
      if (line.type === 'debit') acc.balance += Number(line.amount);
      else acc.balance -= Number(line.amount);
      await this.accountRepo.save(acc);
    }
    return saved;
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
      .leftJoinAndSelect('entry.lines', 'line');
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
}
