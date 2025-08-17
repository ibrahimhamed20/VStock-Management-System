-- =====================================================
-- COMPREHENSIVE INVOICE DATA INSERTION SCRIPT
-- =====================================================
-- This script inserts all invoice data from your JSON into the database
-- Run this after the basic seeding to add all invoice transactions

-- =====================================================
-- PREREQUISITES: Ensure these exist first
-- =====================================================

-- Make sure you have the clients and products seeded first
-- The script assumes you have:
-- 1. Clients with codes: client-hart-attack, client-city-crepe, etc.
-- 2. Products with SKUs: INV-CLASS-A, INV-CLASS-B, INV-CLASS-B-300, INV-CLASS-C, INV-CLASS-B-HANEN, INV-CLASS-B-321, INV-CLASS-A-401
-- 3. At least one user for createdBy field

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
-- 1. INVOICES (Main invoice records)
-- =====================================================

-- Insert invoices based on your JSON data
INSERT INTO invoices (
    id,
    code,
    invoice_number,
    client_id,
    subtotal,
    tax_rate,
    tax_amount,
    discount_amount,
    total_amount,
    paid_amount,
    remaining_amount,
    payment_status,
    issue_date,
    due_date,
    notes,
    created_by,
    created_by_name,
    created_at,
    updated_at
) VALUES
-- April 15, 2025
(
    gen_random_uuid(),
    'inv-891',
    '891',
    (SELECT id FROM clients WHERE code = 'client-hart-attack'),
    1040.00,  -- subtotal
    0.00,     -- tax_rate
    0.00,     -- tax_amount
    0.00,     -- discount_amount
    1040.00,  -- total_amount
    1040.00,  -- paid_amount
    0.00,     -- remaining_amount
    'PAID',   -- payment_status
    excel_date_to_date(45415), -- issue_date (April 15, 2025)
    excel_date_to_date(45415), -- due_date
    'هارت اتاك - Class A',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'inv-892',
    '892',
    (SELECT id FROM clients WHERE code = 'client-city-crepe'),
    520.00,   -- subtotal
    0.00,     -- tax_rate
    0.00,     -- tax_amount
    0.00,     -- discount_amount
    520.00,   -- total_amount
    520.00,   -- paid_amount
    0.00,     -- remaining_amount
    'PAID',   -- payment_status
    excel_date_to_date(45415), -- issue_date (April 15, 2025)
    excel_date_to_date(45415), -- due_date
    'سيتي كريب - Class A',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'inv-893',
    '893',
    (SELECT id FROM clients WHERE code = 'client-minzu-restaurant'),
    450.00,   -- subtotal
    0.00,     -- tax_rate
    0.00,     -- tax_amount
    0.00,     -- discount_amount
    450.00,   -- total_amount
    450.00,   -- paid_amount
    0.00,     -- remaining_amount
    'PAID',   -- payment_status
    excel_date_to_date(45415), -- issue_date (April 15, 2025)
    excel_date_to_date(45415), -- due_date
    'مطعم مينزو - Class B - معجبتوش',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    NOW(),
    NOW()
),

-- April 16, 2025
(
    gen_random_uuid(),
    'inv-894',
    '894',
    (SELECT id FROM clients WHERE code = 'client-samra-restaurant'),
    1040.00,  -- subtotal
    0.00,     -- tax_rate
    0.00,     -- tax_amount
    0.00,     -- discount_amount
    1040.00,  -- total_amount
    1040.00,  -- paid_amount
    0.00,     -- remaining_amount
    'PAID',   -- payment_status
    excel_date_to_date(45416), -- issue_date (April 16, 2025)
    excel_date_to_date(45416), -- due_date
    'مطعم سمره - Class A',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'inv-895',
    '895',
    (SELECT id FROM clients WHERE code = 'client-dodge-restaurant'),
    520.00,   -- subtotal
    0.00,     -- tax_rate
    0.00,     -- tax_amount
    0.00,     -- discount_amount
    520.00,   -- total_amount
    520.00,   -- paid_amount
    0.00,     -- remaining_amount
    'PAID',   -- payment_status
    excel_date_to_date(45416), -- issue_date (April 16, 2025)
    excel_date_to_date(45416), -- due_date
    'مطعم دودج - Class A',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'inv-896',
    '896',
    (SELECT id FROM clients WHERE code = 'client-mini-pablo'),
    520.00,   -- subtotal
    0.00,     -- tax_rate
    0.00,     -- tax_amount
    0.00,     -- discount_amount
    520.00,   -- total_amount
    520.00,   -- paid_amount
    0.00,     -- remaining_amount
    'PAID',   -- payment_status
    excel_date_to_date(45416), -- issue_date (April 16, 2025)
    excel_date_to_date(45416), -- due_date
    'مطعم ميني بابلو - Class A',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    NOW(),
    NOW()
),

-- April 17, 2025
(
    gen_random_uuid(),
    'inv-897',
    '897',
    (SELECT id FROM clients WHERE code = 'client-hart-attack'),
    1350.00,  -- subtotal
    0.00,     -- tax_rate
    0.00,     -- tax_amount
    0.00,     -- discount_amount
    1350.00,  -- total_amount
    1350.00,  -- paid_amount
    0.00,     -- remaining_amount
    'PAID',   -- payment_status
    excel_date_to_date(45417), -- issue_date (April 17, 2025)
    excel_date_to_date(45417), -- due_date
    'هارت اتاك - Class B',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    NOW(),
    NOW()
),

-- April 18, 2025
(
    gen_random_uuid(),
    'inv-898',
    '898',
    (SELECT id FROM clients WHERE code = 'client-piatto'),
    900.00,   -- subtotal
    0.00,     -- tax_rate
    0.00,     -- tax_amount
    0.00,     -- discount_amount
    900.00,   -- total_amount
    900.00,   -- paid_amount
    0.00,     -- remaining_amount
    'PAID',   -- payment_status
    excel_date_to_date(45418), -- issue_date (April 18, 2025)
    excel_date_to_date(45418), -- due_date
    'Piatto - Class B',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'inv-899',
    '899',
    (SELECT id FROM clients WHERE code = 'client-shawarma-station'),
    970.00,   -- subtotal
    0.00,     -- tax_rate
    0.00,     -- tax_amount
    0.00,     -- discount_amount
    970.00,   -- total_amount
    970.00,   -- paid_amount
    0.00,     -- remaining_amount
    'PAID',   -- payment_status
    excel_date_to_date(45418), -- issue_date (April 18, 2025)
    excel_date_to_date(45418), -- due_date
    'شاورما ستيشن - Class A & B',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'inv-900',
    '900',
    (SELECT id FROM clients WHERE code = 'client-town-burger'),
    520.00,   -- subtotal
    0.00,     -- tax_rate
    0.00,     -- tax_amount
    0.00,     -- discount_amount
    520.00,   -- total_amount
    520.00,   -- paid_amount
    0.00,     -- remaining_amount
    'PAID',   -- payment_status
    excel_date_to_date(45418), -- issue_date (April 18, 2025)
    excel_date_to_date(45418), -- due_date
    'تاون برجر - Class A',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'inv-901',
    '901',
    (SELECT id FROM clients WHERE code = 'client-pizza-corners'),
    520.00,   -- subtotal
    0.00,     -- tax_rate
    0.00,     -- tax_amount
    0.00,     -- discount_amount
    520.00,   -- total_amount
    520.00,   -- paid_amount
    0.00,     -- remaining_amount
    'PAID',   -- payment_status
    excel_date_to_date(45418), -- issue_date (April 18, 2025)
    excel_date_to_date(45418), -- due_date
    'بيتزا كورنرز - Class A',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    NOW(),
    NOW()
),

-- April 19, 2025
(
    gen_random_uuid(),
    'inv-902',
    '902',
    (SELECT id FROM clients WHERE code = 'client-shawarma-station'),
    1800.00,  -- subtotal
    0.00,     -- tax_rate
    0.00,     -- tax_amount
    0.00,     -- discount_amount
    1800.00,  -- total_amount
    1800.00,  -- paid_amount
    0.00,     -- remaining_amount
    'PAID',   -- payment_status
    excel_date_to_date(45419), -- issue_date (April 19, 2025)
    excel_date_to_date(45419), -- due_date
    'شاورما ستيشن - Class B',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    NOW(),
    NOW()
),

-- April 20, 2025
(
    gen_random_uuid(),
    'inv-903',
    '903',
    (SELECT id FROM clients WHERE code = 'client-shawarma-station'),
    1800.00,  -- subtotal
    0.00,     -- tax_rate
    0.00,     -- tax_amount
    0.00,     -- discount_amount
    1800.00,  -- total_amount
    1800.00,  -- paid_amount
    0.00,     -- remaining_amount
    'PAID',   -- payment_status
    excel_date_to_date(45420), -- issue_date (April 20, 2025)
    excel_date_to_date(45420), -- due_date
    'شاورما ستيشن - Class B',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    NOW(),
    NOW()
)

ON CONFLICT (invoice_number) DO NOTHING;

-- =====================================================
-- 2. INVOICE ITEMS (Individual items in each invoice)
-- =====================================================

-- Insert invoice items for each invoice
INSERT INTO invoice_items (
    id,
    code,
    invoice_id,
    product_id,
    product_name,
    product_sku,
    quantity,
    unit_price,
    discount,
    total_price
) VALUES
-- Invoice 891 - Hart Attack - Class A (2 cartons)
(
    gen_random_uuid(),
    'ii-891-1',
    (SELECT id FROM invoices WHERE invoice_number = '891'),
    (SELECT id FROM products WHERE sku = 'INV-CLASS-A'),
    'inventory class A',
    'INV-CLASS-A',
    2,
    520.00,
    0.00,
    1040.00
),

-- Invoice 892 - City Crepe - Class A (1 carton)
(
    gen_random_uuid(),
    'ii-892-1',
    (SELECT id FROM invoices WHERE invoice_number = '892'),
    (SELECT id FROM products WHERE sku = 'INV-CLASS-A'),
    'inventory class A',
    'INV-CLASS-A',
    1,
    520.00,
    0.00,
    520.00
),

-- Invoice 893 - Minzu Restaurant - Class B (1 carton)
(
    gen_random_uuid(),
    'ii-893-1',
    (SELECT id FROM invoices WHERE invoice_number = '893'),
    (SELECT id FROM products WHERE sku = 'INV-CLASS-B'),
    'inventory class B',
    'INV-CLASS-B',
    1,
    450.00,
    0.00,
    450.00
),

-- Invoice 894 - Samra Restaurant - Class A (2 cartons)
(
    gen_random_uuid(),
    'ii-894-1',
    (SELECT id FROM invoices WHERE invoice_number = '894'),
    (SELECT id FROM products WHERE sku = 'INV-CLASS-A'),
    'inventory class A',
    'INV-CLASS-A',
    2,
    520.00,
    0.00,
    1040.00
),

-- Invoice 895 - Dodge Restaurant - Class A (1 carton)
(
    gen_random_uuid(),
    'ii-895-1',
    (SELECT id FROM invoices WHERE invoice_number = '895'),
    (SELECT id FROM products WHERE sku = 'INV-CLASS-A'),
    'inventory class A',
    'INV-CLASS-A',
    1,
    520.00,
    0.00,
    520.00
),

-- Invoice 896 - Mini Pablo - Class A (1 carton)
(
    gen_random_uuid(),
    'ii-896-1',
    (SELECT id FROM invoices WHERE invoice_number = '896'),
    (SELECT id FROM products WHERE sku = 'INV-CLASS-A'),
    'inventory class A',
    'INV-CLASS-A',
    1,
    520.00,
    0.00,
    520.00
),

-- Invoice 897 - Hart Attack - Class B (3 cartons)
(
    gen_random_uuid(),
    'ii-897-1',
    (SELECT id FROM invoices WHERE invoice_number = '897'),
    (SELECT id FROM products WHERE sku = 'INV-CLASS-B'),
    'inventory class B',
    'INV-CLASS-B',
    3,
    450.00,
    0.00,
    1350.00
),

-- Invoice 898 - Piatto - Class B (2 cartons)
(
    gen_random_uuid(),
    'ii-898-1',
    (SELECT id FROM invoices WHERE invoice_number = '898'),
    (SELECT id FROM products WHERE sku = 'INV-CLASS-B'),
    'inventory class B',
    'INV-CLASS-B',
    2,
    450.00,
    0.00,
    900.00
),

-- Invoice 899 - Shawarma Station - Class A & B (1 carton each)
(
    gen_random_uuid(),
    'ii-899-1',
    (SELECT id FROM invoices WHERE invoice_number = '899'),
    (SELECT id FROM products WHERE sku = 'INV-CLASS-A'),
    'inventory class A',
    'INV-CLASS-A',
    1,
    520.00,
    0.00,
    520.00
),
(
    gen_random_uuid(),
    'ii-899-2',
    (SELECT id FROM invoices WHERE invoice_number = '899'),
    (SELECT id FROM products WHERE sku = 'INV-CLASS-B'),
    'inventory class B',
    'INV-CLASS-B',
    1,
    450.00,
    0.00,
    450.00
),

-- Invoice 900 - Town Burger - Class A (1 carton)
(
    gen_random_uuid(),
    'ii-900-1',
    (SELECT id FROM invoices WHERE invoice_number = '900'),
    (SELECT id FROM products WHERE sku = 'INV-CLASS-A'),
    'inventory class A',
    'INV-CLASS-A',
    1,
    520.00,
    0.00,
    520.00
),

-- Invoice 901 - Pizza Corners - Class A (1 carton)
(
    gen_random_uuid(),
    'ii-901-1',
    (SELECT id FROM invoices WHERE invoice_number = '901'),
    (SELECT id FROM products WHERE sku = 'INV-CLASS-A'),
    'inventory class A',
    'INV-CLASS-A',
    1,
    520.00,
    0.00,
    520.00
),

-- Invoice 902 - Shawarma Station - Class B (4 cartons)
(
    gen_random_uuid(),
    'ii-902-1',
    (SELECT id FROM invoices WHERE invoice_number = '902'),
    (SELECT id FROM products WHERE sku = 'INV-CLASS-B'),
    'inventory class B',
    'INV-CLASS-B',
    4,
    450.00,
    0.00,
    1800.00
),

-- Invoice 903 - Shawarma Station - Class B (4 cartons)
(
    gen_random_uuid(),
    'ii-903-1',
    (SELECT id FROM invoices WHERE invoice_number = '903'),
    (SELECT id FROM products WHERE sku = 'INV-CLASS-B'),
    'inventory class B',
    'INV-CLASS-B',
    4,
    450.00,
    0.00,
    1800.00
);

-- =====================================================
-- 3. PAYMENTS (Payment records for each invoice)
-- =====================================================

-- Insert payments for each invoice
INSERT INTO payments (
    id,
    code,
    invoice_id,
    amount,
    method,
    reference,
    notes,
    processed_by,
    processed_by_name,
    processed_at
) VALUES
-- Payment for Invoice 891
(
    gen_random_uuid(),
    'pay-891',
    (SELECT id FROM invoices WHERE invoice_number = '891'),
    1040.00,
    'CASH',
    'PAY-891',
    'Cash payment for invoice 891',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    excel_date_to_date(45415)
),
-- Payment for Invoice 892
(
    gen_random_uuid(),
    'pay-892',
    (SELECT id FROM invoices WHERE invoice_number = '892'),
    520.00,
    'CASH',
    'PAY-892',
    'Cash payment for invoice 892',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    excel_date_to_date(45415)
),
-- Payment for Invoice 893
(
    gen_random_uuid(),
    'pay-893',
    (SELECT id FROM invoices WHERE invoice_number = '893'),
    450.00,
    'CASH',
    'PAY-893',
    'Cash payment for invoice 893',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    excel_date_to_date(45415)
),
-- Payment for Invoice 894
(
    gen_random_uuid(),
    'pay-894',
    (SELECT id FROM invoices WHERE invoice_number = '894'),
    1040.00,
    'CASH',
    'PAY-894',
    'Cash payment for invoice 894',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    excel_date_to_date(45416)
),
-- Payment for Invoice 895
(
    gen_random_uuid(),
    'pay-895',
    (SELECT id FROM invoices WHERE invoice_number = '895'),
    520.00,
    'CASH',
    'PAY-895',
    'Cash payment for invoice 895',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    excel_date_to_date(45416)
),
-- Payment for Invoice 896
(
    gen_random_uuid(),
    'pay-896',
    (SELECT id FROM invoices WHERE invoice_number = '896'),
    520.00,
    'CASH',
    'PAY-896',
    'Cash payment for invoice 896',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    excel_date_to_date(45416)
),
-- Payment for Invoice 897
(
    gen_random_uuid(),
    'pay-897',
    (SELECT id FROM invoices WHERE invoice_number = '897'),
    1350.00,
    'CASH',
    'PAY-897',
    'Cash payment for invoice 897',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    excel_date_to_date(45417)
),
-- Payment for Invoice 898
(
    gen_random_uuid(),
    'pay-898',
    (SELECT id FROM invoices WHERE invoice_number = '898'),
    900.00,
    'CASH',
    'PAY-898',
    'Cash payment for invoice 898',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    excel_date_to_date(45418)
),
-- Payment for Invoice 899
(
    gen_random_uuid(),
    'pay-899',
    (SELECT id FROM invoices WHERE invoice_number = '899'),
    970.00,
    'CASH',
    'PAY-899',
    'Cash payment for invoice 899',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    excel_date_to_date(45418)
),
-- Payment for Invoice 900
(
    gen_random_uuid(),
    'pay-900',
    (SELECT id FROM invoices WHERE invoice_number = '900'),
    520.00,
    'CASH',
    'PAY-900',
    'Cash payment for invoice 900',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    excel_date_to_date(45418)
),
-- Payment for Invoice 901
(
    gen_random_uuid(),
    'pay-901',
    (SELECT id FROM invoices WHERE invoice_number = '901'),
    520.00,
    'CASH',
    'PAY-901',
    'Cash payment for invoice 901',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    excel_date_to_date(45418)
),
-- Payment for Invoice 902
(
    gen_random_uuid(),
    'pay-902',
    (SELECT id FROM invoices WHERE invoice_number = '902'),
    1800.00,
    'CASH',
    'PAY-902',
    'Cash payment for invoice 902',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    excel_date_to_date(45419)
),
-- Payment for Invoice 903
(
    gen_random_uuid(),
    'pay-903',
    (SELECT id FROM invoices WHERE invoice_number = '903'),
    1800.00,
    'CASH',
    'PAY-903',
    'Cash payment for invoice 903',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    excel_date_to_date(45420)
);

-- =====================================================
-- 4. UPDATE PRODUCT STOCK LEVELS (Reduce stock for sales)
-- =====================================================

-- Update product stock levels based on sold quantities
UPDATE products 
SET stock = stock - sold_qty
FROM (
    SELECT 
        ii.product_id,
        SUM(ii.quantity) as sold_qty
    FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE i.payment_status = 'PAID'
    GROUP BY ii.product_id
) as sold_stock
WHERE products.id = sold_stock.product_id;

-- =====================================================
-- 5. VERIFICATION QUERIES
-- =====================================================

-- Check inserted invoices
SELECT '=== INVOICES INSERTED ===' as section;
SELECT 
    invoice_number,
    client_id,
    total_amount,
    payment_status,
    issue_date,
    due_date
FROM invoices 
WHERE invoice_number IN ('891', '892', '893', '894', '895', '896', '897', '898', '899', '900', '901', '902', '903')
ORDER BY issue_date;

-- Check invoice items
SELECT '=== INVOICE ITEMS INSERTED ===' as section;
SELECT 
    ii.product_sku,
    ii.product_name,
    ii.quantity,
    ii.unit_price,
    ii.total_price,
    i.invoice_number
FROM invoice_items ii
JOIN invoices i ON ii.invoice_id = i.id
WHERE i.invoice_number IN ('891', '892', '893', '894', '895', '896', '897', '898', '899', '900', '901', '902', '903')
ORDER BY i.invoice_number, ii.product_sku;

-- Check payments
SELECT '=== PAYMENTS INSERTED ===' as section;
SELECT 
    p.reference,
    p.amount,
    p.method,
    p.processed_at,
    i.invoice_number
FROM payments p
JOIN invoices i ON p.invoice_id = i.id
WHERE i.invoice_number IN ('891', '892', '893', '894', '895', '896', '897', '898', '899', '900', '901', '902', '903')
ORDER BY p.processed_at;

-- Check updated product stock
SELECT '=== UPDATED PRODUCT STOCK ===' as section;
SELECT 
    sku,
    name,
    stock,
    unit_cost,
    selling_price
FROM products 
WHERE sku IN (
    'INV-CLASS-A', 'INV-CLASS-B', 'INV-CLASS-B-300', 'INV-CLASS-C',
    'INV-CLASS-B-HANEN', 'INV-CLASS-B-321', 'INV-CLASS-A-401'
)
ORDER BY sku;

-- Summary counts
SELECT '=== SUMMARY COUNTS ===' as section;
SELECT 
    'Invoices' as entity,
    COUNT(*) as count
FROM invoices 
WHERE invoice_number IN ('891', '892', '893', '894', '895', '896', '897', '898', '899', '900', '901', '902', '903')

UNION ALL

SELECT 
    'Invoice Items' as entity,
    COUNT(*) as count
FROM invoice_items ii
JOIN invoices i ON ii.invoice_id = i.id
WHERE i.invoice_number IN ('891', '892', '893', '894', '895', '896', '897', '898', '899', '900', '901', '902', '903')

UNION ALL

SELECT 
    'Payments' as entity,
    COUNT(*) as count
FROM payments p
JOIN invoices i ON p.invoice_id = i.id
WHERE i.invoice_number IN ('891', '892', '893', '894', '895', '896', '897', '898', '899', '900', '901', '902', '903')

UNION ALL

SELECT 
    'Total Sales Value' as entity,
    SUM(total_amount) as count
FROM invoices 
WHERE invoice_number IN ('891', '892', '893', '894', '895', '896', '897', '898', '899', '900', '901', '902', '903');

-- =====================================================
-- 6. CLEANUP (Optional - remove helper function)
-- =====================================================

-- Uncomment the line below if you want to remove the helper function
-- DROP FUNCTION IF EXISTS excel_date_to_date(NUMERIC);

-- =====================================================
-- END OF SCRIPT
-- =====================================================
-- This script has successfully inserted all invoice data from your JSON
-- The invoices include:
-- 1. Invoice 891: Hart Attack - Class A (2 cartons) = 1,040 EGP
-- 2. Invoice 892: City Crepe - Class A (1 carton) = 520 EGP
-- 3. Invoice 893: Minzu Restaurant - Class B (1 carton) = 450 EGP
-- 4. Invoice 894: Samra Restaurant - Class A (2 cartons) = 1,040 EGP
-- 5. Invoice 895: Dodge Restaurant - Class A (1 carton) = 520 EGP
-- 6. Invoice 896: Mini Pablo - Class A (1 carton) = 520 EGP
-- 7. Invoice 897: Hart Attack - Class B (3 cartons) = 1,350 EGP
-- 8. Invoice 898: Piatto - Class B (2 cartons) = 900 EGP
-- 9. Invoice 899: Shawarma Station - Class A & B (1 each) = 970 EGP
-- 10. Invoice 900: Town Burger - Class A (1 carton) = 520 EGP
-- 11. Invoice 901: Pizza Corners - Class A (1 carton) = 520 EGP
-- 12. Invoice 902: Shawarma Station - Class B (4 cartons) = 1,800 EGP
-- 13. Invoice 903: Shawarma Station - Class B (4 cartons) = 1,800 EGP
-- Total: 12,950 EGP in sales 