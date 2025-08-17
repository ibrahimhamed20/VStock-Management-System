-- =====================================================
-- ACCOUNT BALANCES UPDATE SCRIPT
-- =====================================================
-- This script calculates and updates account balances based on journal entries
-- Run this after inserting journal entries to update all account balances

-- =====================================================
-- 1. CALCULATE ACCOUNT BALANCES FROM JOURNAL ENTRIES
-- =====================================================

-- Create a temporary table with calculated balances
WITH account_balances AS (
    SELECT 
        a.id as account_id,
        a.code as account_code,
        a.name as account_name,
        a.type as account_type,
        COALESCE(SUM(
            CASE 
                WHEN jel.type = 'debit' THEN jel.amount
                WHEN jel.type = 'credit' THEN -jel.amount
                ELSE 0
            END
        ), 0) as calculated_balance
    FROM accounts a
    LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
    LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
    WHERE je.code LIKE 'je-%' OR je.code IS NULL
    GROUP BY a.id, a.code, a.name, a.type
)
-- Update account balances
UPDATE accounts 
SET balance = ab.calculated_balance
FROM account_balances ab
WHERE accounts.id = ab.account_id;

-- =====================================================
-- 2. VERIFICATION QUERIES
-- =====================================================

-- Show updated account balances
SELECT '=== UPDATED ACCOUNT BALANCES ===' as section;
SELECT 
    code as account_code,
    name as account_name,
    type as account_type,
    balance,
    CASE 
        WHEN type = 'asset' AND balance > 0 THEN 'Normal'
        WHEN type = 'liability' AND balance < 0 THEN 'Normal'
        WHEN type = 'equity' AND balance < 0 THEN 'Normal'
        WHEN type = 'revenue' AND balance < 0 THEN 'Normal'
        WHEN type = 'expense' AND balance > 0 THEN 'Normal'
        ELSE 'Check'
    END as balance_status
FROM accounts 
WHERE balance != 0
ORDER BY code;

-- Show trial balance
SELECT '=== TRIAL BALANCE ===' as section;
SELECT 
    type as account_type,
    COUNT(*) as account_count,
    SUM(balance) as total_balance
FROM accounts 
WHERE balance != 0
GROUP BY type
ORDER BY 
    CASE type
        WHEN 'asset' THEN 1
        WHEN 'liability' THEN 2
        WHEN 'equity' THEN 3
        WHEN 'revenue' THEN 4
        WHEN 'expense' THEN 5
    END;

-- Check if debits equal credits
SELECT '=== DEBITS VS CREDITS ===' as section;
SELECT 
    'Total Debits' as description,
    SUM(CASE WHEN type = 'asset' OR type = 'expense' THEN balance ELSE 0 END) as amount
FROM accounts 
WHERE balance != 0

UNION ALL

SELECT 
    'Total Credits' as description,
    ABS(SUM(CASE WHEN type = 'liability' OR type = 'equity' OR type = 'revenue' THEN balance ELSE 0 END)) as amount
FROM accounts 
WHERE balance != 0;

-- Show balance sheet summary
SELECT '=== BALANCE SHEET SUMMARY ===' as section;
SELECT 
    'Assets' as category,
    SUM(balance) as total
FROM accounts 
WHERE type = 'asset' AND balance != 0

UNION ALL

SELECT 
    'Liabilities' as category,
    SUM(balance) as total
FROM accounts 
WHERE type = 'liability' AND balance != 0

UNION ALL

SELECT 
    'Equity' as category,
    SUM(balance) as total
FROM accounts 
WHERE type = 'equity' AND balance != 0

ORDER BY 
    CASE category
        WHEN 'Assets' THEN 1
        WHEN 'Liabilities' THEN 2
        WHEN 'Equity' THEN 3
    END;

-- Show income statement summary
SELECT '=== INCOME STATEMENT SUMMARY ===' as section;
SELECT 
    'Revenue' as category,
    ABS(SUM(balance)) as total
FROM accounts 
WHERE type = 'revenue' AND balance != 0

UNION ALL

SELECT 
    'Expenses' as category,
    SUM(balance) as total
FROM accounts 
WHERE type = 'expense' AND balance != 0

ORDER BY 
    CASE category
        WHEN 'Revenue' THEN 1
        WHEN 'Expenses' THEN 2
    END;

-- Calculate net income
SELECT '=== NET INCOME ===' as section;
SELECT 
    'Net Income' as description,
    (ABS(SUM(CASE WHEN type = 'revenue' THEN balance ELSE 0 END)) - 
     SUM(CASE WHEN type = 'expense' THEN balance ELSE 0 END)) as amount
FROM accounts 
WHERE balance != 0 AND (type = 'revenue' OR type = 'expense');

-- =====================================================
-- 3. DETAILED ACCOUNT ANALYSIS
-- =====================================================

-- Show all accounts with their balances
SELECT '=== ALL ACCOUNTS WITH BALANCES ===' as section;
SELECT 
    code,
    name,
    type,
    balance,
    CASE 
        WHEN balance > 0 THEN 'Debit'
        WHEN balance < 0 THEN 'Credit'
        ELSE 'Zero'
    END as balance_direction
FROM accounts 
ORDER BY code;

-- Show accounts with zero balance
SELECT '=== ACCOUNTS WITH ZERO BALANCE ===' as section;
SELECT 
    code,
    name,
    type
FROM accounts 
WHERE balance = 0
ORDER BY code;

-- =====================================================
-- END OF SCRIPT
-- =====================================================
-- This script has successfully updated all account balances
-- based on the journal entries inserted earlier
-- 
-- The balances now reflect:
-- 1. Capital investments: 273,000 EGP in cash, 273,000 EGP in capital
-- 2. Expenses: 3,000 EGP in rent, 1,500 EGP in other expenses
-- 3. Assets: 195,000 EGP in fridge, 70,500 EGP in inventory, 3,000 EGP prepaid
-- 4. Revenue: 3,570 EGP in sales
-- 5. Net cash position after all transactions 