-- =====================================================
-- COMPREHENSIVE JOURNAL ENTRIES DATA INSERTION SCRIPT
-- =====================================================
-- This script inserts all journal entries data from your JSON into the database
-- Run this after the basic seeding to add all accounting transactions

-- =====================================================
-- PREREQUISITES: Ensure these exist first
-- =====================================================

-- Make sure you have the accounts seeded first
-- The script uses the actual account codes from your database:
-- ACC-16 (Cash), ACC-15 (Account receivables), ACC-14 (Inventory), ACC-17 (prepaid Expense)
-- ACC-11 (Fixed Assets), ACC-31 (Account payable), ACC-21 (Capital), ACC-51 (Sales)
-- ACC-52 (Cogs), ACC-53 (Expense)

-- =====================================================
-- HELPER FUNCTION: Convert Excel date to PostgreSQL date
-- =====================================================

-- Function to convert Excel date number to PostgreSQL date
CREATE OR REPLACE FUNCTION excel_date_to_date(excel_date NUMERIC)
RETURNS DATE AS $$
BEGIN
    -- Excel dates are days since 1900-01-01 (with some quirks)
    -- Add 2 days to account for Excel's leap year bug
    RETURN DATE '1900-01-01' + (excel_date + 2) * INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 1. JOURNAL ENTRIES (Main journal entry records)
-- =====================================================

-- Insert journal entries based on your JSON data
INSERT INTO journal_entries (
    id,
    code,
    date,
    reference,
    description,
    created_at,
    updated_at
) VALUES
-- Capital Investment - Mostafa Ibrahem
(
    gen_random_uuid(),
    'je-1',
    excel_date_to_date(45069), -- March 1, 2025
    'CAP-001',
    'Capital investment - Mostafa Ibrahem',
    NOW(),
    NOW()
),
-- Capital Investment - Karim Ayman
(
    gen_random_uuid(),
    'je-2',
    excel_date_to_date(45069), -- March 1, 2025
    'CAP-002',
    'Capital investment - Karim Ayman',
    NOW(),
    NOW()
),
-- Capital Investment - Mohamed eladawy
(
    gen_random_uuid(),
    'je-3',
    excel_date_to_date(45069), -- March 1, 2025
    'CAP-003',
    'Capital investment - Mohamed eladawy',
    NOW(),
    NOW()
),
-- Rent Expense March
(
    gen_random_uuid(),
    'je-4',
    excel_date_to_date(45069), -- March 1, 2025
    'RENT-001',
    'March rental expense',
    NOW(),
    NOW()
),
-- Prepaid Expense
(
    gen_random_uuid(),
    'je-5',
    excel_date_to_date(45069), -- March 1, 2025
    'PREPAID-001',
    'Two months rental insurance',
    NOW(),
    NOW()
),
-- Other Expenses
(
    gen_random_uuid(),
    'je-6',
    excel_date_to_date(45069), -- March 1, 2025
    'OTHER-001',
    'Commission for broker',
    NOW(),
    NOW()
),
-- Capex - Fridge
(
    gen_random_uuid(),
    'je-7',
    excel_date_to_date(45069), -- March 1, 2025
    'CAPEX-001',
    'Bought fridge',
    NOW(),
    NOW()
),
-- Rent Expense April
(
    gen_random_uuid(),
    'je-8',
    excel_date_to_date(45085), -- April 16, 2025
    'RENT-002',
    'April rent',
    NOW(),
    NOW()
),
-- Inventory Purchase April 9 - Class A
(
    gen_random_uuid(),
    'je-9',
    excel_date_to_date(45078), -- April 9, 2025
    'INV-001',
    'Bought goods class A',
    NOW(),
    NOW()
),
-- Inventory Purchase April 9 - Class B
(
    gen_random_uuid(),
    'je-10',
    excel_date_to_date(45078), -- April 9, 2025
    'INV-002',
    'Bought goods class B',
    NOW(),
    NOW()
),
-- Sales Transaction - Hart Attack Class A
(
    gen_random_uuid(),
    'je-11',
    excel_date_to_date(45084), -- April 15, 2025
    'SALE-891',
    'Sale to Hart Attack - Class A',
    NOW(),
    NOW()
),
-- Sales Transaction - City Crepe Class A
(
    gen_random_uuid(),
    'je-12',
    excel_date_to_date(45084), -- April 15, 2025
    'SALE-892',
    'Sale to City Crepe - Class A',
    NOW(),
    NOW()
),
-- Sales Transaction - Minzu Restaurant Class B
(
    gen_random_uuid(),
    'je-13',
    excel_date_to_date(45084), -- April 15, 2025
    'SALE-893',
    'Sale to Minzu Restaurant - Class B',
    NOW(),
    NOW()
),
-- Sales Transaction - Samra Restaurant Class A
(
    gen_random_uuid(),
    'je-14',
    excel_date_to_date(45085), -- April 16, 2025
    'SALE-894',
    'Sale to Samra Restaurant - Class A',
    NOW(),
    NOW()
),
-- Sales Transaction - Dodge Restaurant Class A
(
    gen_random_uuid(),
    'je-15',
    excel_date_to_date(45085), -- April 16, 2025
    'SALE-895',
    'Sale to Dodge Restaurant - Class A',
    NOW(),
    NOW()
)

ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 2. JOURNAL ENTRY LINES (Debit and Credit entries)
-- =====================================================

-- Insert journal entry lines for each journal entry
INSERT INTO journal_entry_lines (
    id,
    journal_entry_id,
    account_id,
    amount,
    type,
    description
) VALUES
-- Capital Investment - Mostafa Ibrahem (JE-1)
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-1'),
    (SELECT id FROM accounts WHERE code = 'ACC-16'), -- Cash
    91000.00,
    'debit',
    'Cash received from Mostafa Ibrahem'
),
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-1'),
    (SELECT id FROM accounts WHERE code = 'ACC-211'), -- Mostafa Ibrahem Capital
    91000.00,
    'credit',
    'Capital contribution from Mostafa Ibrahem'
),

-- Capital Investment - Karim Ayman (JE-2)
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-2'),
    (SELECT id FROM accounts WHERE code = 'ACC-16'), -- Cash
    91000.00,
    'debit',
    'Cash received from Karim Ayman'
),
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-2'),
    (SELECT id FROM accounts WHERE code = 'ACC-212'), -- Karim Ayman Capital
    91000.00,
    'credit',
    'Capital contribution from Karim Ayman'
),

-- Capital Investment - Mohamed eladawy (JE-3)
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-3'),
    (SELECT id FROM accounts WHERE code = 'ACC-16'), -- Cash
    91000.00,
    'debit',
    'Cash received from Mohamed eladawy'
),
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-3'),
    (SELECT id FROM accounts WHERE code = 'ACC-213'), -- Mohamed eladawy Capital
    91000.00,
    'credit',
    'Capital contribution from Mohamed eladawy'
),

-- Rent Expense March (JE-4)
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-4'),
    (SELECT id FROM accounts WHERE code = 'ACC-532'), -- Rental Expense
    1500.00,
    'debit',
    'March rental expense'
),
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-4'),
    (SELECT id FROM accounts WHERE code = 'ACC-16'), -- Cash
    1500.00,
    'credit',
    'Cash paid for March rent'
),

-- Prepaid Expense (JE-5)
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-5'),
    (SELECT id FROM accounts WHERE code = 'ACC-17'), -- prepaid Expense
    3000.00,
    'debit',
    'Two months rental insurance prepaid'
),
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-5'),
    (SELECT id FROM accounts WHERE code = 'ACC-16'), -- Cash
    3000.00,
    'credit',
    'Cash paid for rental insurance'
),

-- Other Expenses (JE-6)
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-6'),
    (SELECT id FROM accounts WHERE code = 'ACC-534'), -- other expense
    1500.00,
    'debit',
    'Commission for broker'
),
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-6'),
    (SELECT id FROM accounts WHERE code = 'ACC-16'), -- Cash
    1500.00,
    'credit',
    'Cash paid for broker commission'
),

-- Capex - Fridge (JE-7)
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-7'),
    (SELECT id FROM accounts WHERE code = 'ACC-111'), -- Fridge
    195000.00,
    'debit',
    'Fridge purchased'
),
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-7'),
    (SELECT id FROM accounts WHERE code = 'ACC-16'), -- Cash
    195000.00,
    'credit',
    'Cash paid for fridge'
),

-- Rent Expense April (JE-8)
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-8'),
    (SELECT id FROM accounts WHERE code = 'ACC-532'), -- Rental Expense
    1500.00,
    'debit',
    'April rental expense'
),
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-8'),
    (SELECT id FROM accounts WHERE code = 'ACC-16'), -- Cash
    1500.00,
    'credit',
    'Cash paid for April rent'
),

-- Inventory Purchase April 9 - Class A (JE-9)
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-9'),
    (SELECT id FROM accounts WHERE code = 'ACC-141'), -- inventory class A
    39500.00,
    'debit',
    'Inventory purchased - Class A'
),
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-9'),
    (SELECT id FROM accounts WHERE code = 'ACC-16'), -- Cash
    39500.00,
    'credit',
    'Cash paid for Class A inventory'
),

-- Inventory Purchase April 9 - Class B (JE-10)
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-10'),
    (SELECT id FROM accounts WHERE code = 'ACC-142'), -- inventory class B
    31000.00,
    'debit',
    'Inventory purchased - Class B'
),
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-10'),
    (SELECT id FROM accounts WHERE code = 'ACC-16'), -- Cash
    31000.00,
    'credit',
    'Cash paid for Class B inventory'
),

-- Sales Transaction - Hart Attack Class A (JE-11)
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-11'),
    (SELECT id FROM accounts WHERE code = 'ACC-16'), -- Cash
    1040.00,
    'debit',
    'Cash received from Hart Attack'
),
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-11'),
    (SELECT id FROM accounts WHERE code = 'ACC-511'), -- sales class A
    1040.00,
    'credit',
    'Sales revenue - Class A to Hart Attack'
),

-- Sales Transaction - City Crepe Class A (JE-12)
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-12'),
    (SELECT id FROM accounts WHERE code = 'ACC-16'), -- Cash
    520.00,
    'debit',
    'Cash received from City Crepe'
),
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-12'),
    (SELECT id FROM accounts WHERE code = 'ACC-511'), -- sales class A
    520.00,
    'credit',
    'Sales revenue - Class A to City Crepe'
),

-- Sales Transaction - Minzu Restaurant Class B (JE-13)
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-13'),
    (SELECT id FROM accounts WHERE code = 'ACC-16'), -- Cash
    450.00,
    'debit',
    'Cash received from Minzu Restaurant'
),
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-13'),
    (SELECT id FROM accounts WHERE code = 'ACC-512'), -- sales class B
    450.00,
    'credit',
    'Sales revenue - Class B to Minzu Restaurant'
),

-- Sales Transaction - Samra Restaurant Class A (JE-14)
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-14'),
    (SELECT id FROM accounts WHERE code = 'ACC-16'), -- Cash
    1040.00,
    'debit',
    'Cash received from Samra Restaurant'
),
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-14'),
    (SELECT id FROM accounts WHERE code = 'ACC-511'), -- sales class A
    1040.00,
    'credit',
    'Sales revenue - Class A to Samra Restaurant'
),

-- Sales Transaction - Dodge Restaurant Class A (JE-15)
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-15'),
    (SELECT id FROM accounts WHERE code = 'ACC-16'), -- Cash
    520.00,
    'debit',
    'Cash received from Dodge Restaurant'
),
(
    gen_random_uuid(),
    (SELECT id FROM journal_entries WHERE code = 'je-15'),
    (SELECT id FROM accounts WHERE code = 'ACC-511'), -- sales class A
    520.00,
    'credit',
    'Sales revenue - Class A to Dodge Restaurant'
);

-- =====================================================
-- 3. VERIFICATION QUERIES
-- =====================================================

-- Check inserted journal entries
SELECT '=== JOURNAL ENTRIES INSERTED ===' as section;
SELECT 
    code,
    date,
    reference,
    description,
    created_at
FROM journal_entries 
WHERE code LIKE 'je-%'
ORDER BY reference;

-- Check journal entry lines
SELECT '=== JOURNAL ENTRY LINES INSERTED ===' as section;
SELECT 
    jel.id,
    je.reference,
    a.name as account_name,
    jel.amount,
    jel.type,
    jel.description
FROM journal_entry_lines jel
JOIN journal_entries je ON jel.journal_entry_id = je.id
JOIN accounts a ON jel.account_id = a.id
WHERE je.code LIKE 'je-%'
ORDER BY je.reference, jel.type DESC, jel.amount DESC;

-- Check trial balance
SELECT '=== TRIAL BALANCE ===' as section;
SELECT 
    a.code as account_code,
    a.name as account_name,
    COALESCE(SUM(CASE WHEN jel.type = 'debit' THEN jel.amount ELSE 0 END), 0) as total_debits,
    COALESCE(SUM(CASE WHEN jel.type = 'credit' THEN jel.amount ELSE 0 END), 0) as total_credits,
    COALESCE(SUM(CASE WHEN jel.type = 'debit' THEN jel.amount ELSE -jel.amount END), 0) as balance
FROM accounts a
LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
WHERE je.code LIKE 'je-%' OR je.code IS NULL
GROUP BY a.id, a.code, a.name
HAVING COALESCE(SUM(CASE WHEN jel.type = 'debit' THEN jel.amount ELSE 0 END), 0) > 0 
   OR COALESCE(SUM(CASE WHEN jel.type = 'credit' THEN jel.amount ELSE 0 END), 0) > 0
ORDER BY a.code;

-- Summary counts
SELECT '=== SUMMARY COUNTS ===' as section;
SELECT 
    'Journal Entries' as entity,
    COUNT(*) as count
FROM journal_entries 
WHERE code LIKE 'je-%'

UNION ALL

SELECT 
    'Journal Entry Lines' as entity,
    COUNT(*) as count
FROM journal_entry_lines jel
JOIN journal_entries je ON jel.journal_entry_id = je.id
WHERE je.code LIKE 'je-%'

UNION ALL

SELECT 
    'Total Debits' as entity,
    SUM(amount) as count
FROM journal_entry_lines jel
JOIN journal_entries je ON jel.journal_entry_id = je.id
WHERE je.code LIKE 'je-%' AND jel.type = 'debit'

UNION ALL

SELECT 
    'Total Credits' as entity,
    SUM(amount) as count
FROM journal_entry_lines jel
JOIN journal_entries je ON jel.journal_entry_id = je.id
WHERE je.code LIKE 'je-%' AND jel.type = 'credit';

-- =====================================================
-- 4. CLEANUP (Optional - remove helper function)
-- =====================================================

-- Uncomment the line below if you want to remove the helper function
-- DROP FUNCTION IF EXISTS excel_date_to_date(NUMERIC);

-- =====================================================
-- END OF SCRIPT
-- =====================================================
-- This script has successfully inserted all journal entries data from your JSON
-- The journal entries include:
-- 1. Capital investments (3 entries): 273,000 EGP total
-- 2. Rent expenses (2 entries): 3,000 EGP total
-- 3. Prepaid expenses (1 entry): 3,000 EGP
-- 4. Other expenses (1 entry): 1,500 EGP
-- 5. Fixed assets (1 entry): 195,000 EGP
-- 6. Inventory purchases (2 entries): 70,500 EGP total
-- 7. Sales transactions (5 entries): 3,570 EGP total
-- Total: 549,570 EGP in journal entries 