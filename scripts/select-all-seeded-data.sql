-- =====================================================
-- COMPREHENSIVE SELECT SCRIPT FOR ALL SEEDED ENTITIES
-- =====================================================
-- This script selects all data that was seeded by the comprehensive seeding system
-- Run this after executing the seeding script to verify all data was created correctly

-- =====================================================
-- 1. ROLES
-- =====================================================
SELECT '=== ROLES ===' as section;
SELECT 
    id,
    code,
    name,
    description,
    created_at,
    updated_at
FROM roles
ORDER BY code;

-- =====================================================
-- 2. USERS
-- =====================================================
SELECT '=== USERS ===' as section;
SELECT 
    id,
    code,
    username,
    email,
    status,
    created_at,
    updated_at
FROM users 
ORDER BY username;

-- =====================================================
-- 3. CLIENTS
-- =====================================================
SELECT '=== CLIENTS ===' as section;
SELECT 
    id,
    code,
    name,
    email,
    phone,
    created_at,
    updated_at
FROM clients 
ORDER BY name;

-- =====================================================
-- 4. PRODUCTS
-- =====================================================
SELECT '=== PRODUCTS ===' as section;
SELECT 
    id,
    code,
    sku,
    name,
    description,
    unit_cost,
    selling_price,
    stock,
    classification,
    category,
    supplier,
    created_at,
    updated_at
FROM products 
ORDER BY sku;

-- =====================================================
-- 5. ACCOUNTS (Chart of Accounts)
-- =====================================================
SELECT '=== ACCOUNTS ===' as section;
SELECT 
    id,
    code,
    name,
    type,
    balance,
    created_at,
    updated_at
FROM accounts 
ORDER BY code;

-- =====================================================
-- 6. SUPPLIERS
-- =====================================================
SELECT '=== SUPPLIERS ===' as section;
SELECT 
    id,
    code,
    name,
    contact_person,
    email,
    phone,
    address,
    status,
    created_at,
    updated_at
FROM suppliers 

-- =====================================================
-- 7. PURCHASES (if they exist)
-- =====================================================
SELECT '=== PURCHASES ===' as section;
SELECT 
    id,
    purchase_number,
    supplier_id,
    total_amount,
    order_date,
    expected_delivery_date,
    actual_delivery_date,
    purchase_status,
    payment_status,
    created_at,
    updated_at
FROM purchases 
ORDER BY purchase_number;

-- =====================================================
-- 8. PURCHASE ITEMS (if they exist)
-- =====================================================
SELECT '=== PURCHASE ITEMS ===' as section;
SELECT 
    pi.id,
    pi.purchase_id,
    pi.product_id,
    pi.product_name,
    pi.product_sku,
    pi.quantity,
    pi.unit_cost,
    pi.total_cost,
    pi.received_quantity,
    pi.created_at,
    pi.updated_at,
    p.purchase_number
FROM purchase_items pi
JOIN purchases p ON pi.purchase_id = p.id
ORDER BY p.purchase_number, pi.product_sku;

-- =====================================================
-- 9. INVOICES (if they exist)
-- =====================================================
SELECT '=== INVOICES ===' as section;
SELECT 
    id,
    invoice_number,
    client_id,
    total_amount,
    issue_date,
    due_date,
    payment_status,
    created_at,
    updated_at  
FROM invoices 
ORDER BY invoice_number;

-- =====================================================
-- 10. INVOICE ITEMS (if they exist)
-- =====================================================
SELECT '=== INVOICE ITEMS ===' as section;
SELECT 
    ii.id,
    ii.invoice_id,
    ii.product_id,
    ii.product_name,
    ii.product_sku,
    ii.quantity,
    ii.unit_price,
    ii.discount,
    ii.total_price,
    ii.created_at,
    ii.updated_at,
    i.invoice_number
FROM invoice_items ii
JOIN invoices i ON ii.invoice_id = i.id
ORDER BY i.invoice_number, ii.product_sku;

-- =====================================================
-- 11. PAYMENTS (if they exist)
-- =====================================================
SELECT '=== PAYMENTS ===' as section;
SELECT 
    id,
    invoice_id,
    amount,
    payment_date,
    payment_method,
    reference_number,
    created_at,
    updated_at
FROM payments 
ORDER BY payment_date;

-- =====================================================
-- 12. JOURNAL ENTRIES (if they exist)
-- =====================================================
SELECT '=== JOURNAL ENTRIES ===' as section;
SELECT 
    id,
    date,
    reference,
    description,
    created_at,
    updated_at
FROM journal_entries 
ORDER BY reference;

-- =====================================================
-- 13. JOURNAL ENTRY LINES (if they exist)
-- =====================================================
SELECT '=== JOURNAL ENTRY LINES ===' as section;
SELECT 
    jel.id,
    jel.journal_entry_id,
    jel.account_id,
    jel.amount,
    jel.type,
    jel.description,
    jel.created_at,
    jel.updated_at,
    je.reference,
    a.name as account_name
FROM journal_entry_lines jel
JOIN journal_entries je ON jel.journal_entry_id = je.id
JOIN accounts a ON jel.account_id = a.id
ORDER BY je.reference, jel.type DESC, jel.amount DESC;

-- =====================================================
-- 14. SUMMARY COUNTS
-- =====================================================
SELECT '=== SUMMARY COUNTS ===' as section;
SELECT 
    'Roles' as entity,
    COUNT(*) as count
FROM roles 

UNION ALL

SELECT 
    'Users' as entity,
    COUNT(*) as count
FROM users 

UNION ALL

SELECT 
    'Clients' as entity,
    COUNT(*) as count
FROM clients 

UNION ALL

SELECT 
    'Products' as entity,
    COUNT(*) as count
FROM products 

UNION ALL

SELECT 
    'Accounts' as entity,
    COUNT(*) as count
FROM accounts 

UNION ALL

SELECT 
    'Suppliers' as entity,
    COUNT(*) as count
FROM suppliers 

UNION ALL

SELECT 
    'Purchases' as entity,
    COUNT(*) as count
FROM purchases  

UNION ALL

SELECT 
    'Invoices' as entity,
    COUNT(*) as count
FROM invoices 

UNION ALL

SELECT 
    'Journal Entries' as entity,
    COUNT(*) as count
FROM journal_entries 

ORDER BY entity;

-- =====================================================
-- 15. DATA VALIDATION CHECKS
-- =====================================================
SELECT '=== DATA VALIDATION CHECKS ===' as section;

-- Check for missing required data
SELECT 
    'Missing Roles' as check_type,
    COUNT(*) as missing_count
FROM (
    SELECT 'role-admin' as required_code
    UNION SELECT 'role-manager'
    UNION SELECT 'role-cashier'
    UNION SELECT 'role-accountant'
) required_roles
LEFT JOIN roles r ON required_roles.required_code = r.code
WHERE r.id IS NULL

UNION ALL

SELECT 
    'Missing Users' as check_type,
    COUNT(*) as missing_count
FROM (
    SELECT 'admin' as required_username
    UNION SELECT 'mostafa'
    UNION SELECT 'karim'
    UNION SELECT 'mohamed'
    UNION SELECT 'manager1'
) required_users
LEFT JOIN users u ON required_users.required_username = u.username
WHERE u.id IS NULL

UNION ALL

SELECT 
    'Missing Products' as check_type,
    COUNT(*) as missing_count
FROM (
    SELECT 'INV-CLASS-A' as required_sku
    UNION SELECT 'INV-CLASS-B'
    UNION SELECT 'INV-CLASS-B-300'
    UNION SELECT 'INV-CLASS-C'
    UNION SELECT 'INV-CLASS-B-HANEN'
    UNION SELECT 'INV-CLASS-B-321'
    UNION SELECT 'INV-CLASS-A-401'
) required_products
LEFT JOIN products p ON required_products.required_sku = p.sku
WHERE p.id IS NULL;

-- =====================================================
-- END OF SCRIPT
-- =====================================================
-- This script will show you all the seeded data in your database
-- Run it after executing the seeding script to verify everything was created correctly 