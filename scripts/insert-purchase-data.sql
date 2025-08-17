-- =====================================================
-- COMPREHENSIVE PURCHASE DATA INSERTION SCRIPT
-- =====================================================
-- This script inserts all purchase data from your JSON into the database
-- Run this after the basic seeding to add all purchase transactions

-- =====================================================
-- PREREQUISITES: Ensure these exist first
-- =====================================================

-- Make sure you have the supplier and products seeded first
-- The script assumes you have:
-- 1. Supplier with code 'supplier-tunkaya' 
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
-- 1. PURCHASE ORDERS (Main purchase records)
-- =====================================================

-- Insert purchase orders based on your JSON data
INSERT INTO purchases (
    id,
    code,
    purchase_number,
    supplier_id,
    subtotal,
    tax_rate,
    tax_amount,
    shipping_cost,
    total_amount,
    paid_amount,
    remaining_amount,
    purchase_status,
    payment_status,
    order_date,
    expected_delivery_date,
    actual_delivery_date,
    notes,
    created_by,
    created_by_name,
    created_at,
    updated_at
) VALUES
-- Purchase Order 1: Class A and B (100 units each)
(
    gen_random_uuid(),
    'purchase-2025-04-09-001',
    'PO-2025-04-09-001',
    (SELECT id FROM suppliers WHERE code = 'supplier-tunkaya'),
    70500.00,  -- subtotal (395*100 + 310*100)
    0.00,      -- tax_rate
    0.00,      -- tax_amount
    0.00,      -- shipping_cost
    70500.00,  -- total_amount
    70500.00,  -- paid_amount
    0.00,      -- remaining_amount
    'RECEIVED', -- purchase_status
    'PAID',    -- payment_status
    excel_date_to_date(45409), -- order_date (April 9, 2025)
    excel_date_to_date(45409), -- expected_delivery_date
    excel_date_to_date(45409), -- actual_delivery_date
    'Initial inventory purchase - Class A and B products',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    NOW(),
    NOW()
),

-- Purchase Order 2: Class B-300 and C
(
    gen_random_uuid(),
    'purchase-2025-05-10-001',
    'PO-2025-05-10-001',
    (SELECT id FROM suppliers WHERE code = 'supplier-tunkaya'),
    44200.00,  -- subtotal (300*42 + 200*158)
    0.00,      -- tax_rate
    0.00,      -- tax_amount
    0.00,      -- shipping_cost
    44200.00,  -- total_amount
    44200.00,  -- paid_amount
    0.00,      -- remaining_amount
    'RECEIVED', -- purchase_status
    'PAID',    -- payment_status
    excel_date_to_date(45440), -- order_date (May 10, 2025)
    excel_date_to_date(45440), -- expected_delivery_date
    excel_date_to_date(45440), -- actual_delivery_date
    'Inventory purchase - Class B-300 and C products',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    NOW(),
    NOW()
),

-- Purchase Order 3: Class B-hanen
(
    gen_random_uuid(),
    'purchase-2025-06-02-001',
    'PO-2025-06-02-001',
    (SELECT id FROM suppliers WHERE code = 'supplier-tunkaya'),
    80900.00,  -- subtotal (315*257)
    0.00,      -- tax_rate
    0.00,      -- tax_amount
    0.00,      -- shipping_cost
    80900.00,  -- total_amount
    80900.00,  -- paid_amount
    0.00,      -- remaining_amount
    'RECEIVED', -- purchase_status
    'PAID',    -- payment_status
    excel_date_to_date(45463), -- order_date (June 2, 2025)
    excel_date_to_date(45463), -- expected_delivery_date
    excel_date_to_date(45463), -- actual_delivery_date
    'Inventory purchase - Class B-hanen products',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    NOW(),
    NOW()
),

-- Purchase Order 4: Class B-321
(
    gen_random_uuid(),
    'purchase-2025-06-19-001',
    'PO-2025-06-19-001',
    (SELECT id FROM suppliers WHERE code = 'supplier-tunkaya'),
    41133.00,  -- subtotal (321.35*128)
    0.00,      -- tax_rate
    0.00,      -- tax_amount
    0.00,      -- shipping_cost
    41133.00,  -- total_amount
    41133.00,  -- paid_amount
    0.00,      -- remaining_amount
    'RECEIVED', -- purchase_status
    'PAID',    -- payment_status
    excel_date_to_date(45480), -- order_date (June 19, 2025)
    excel_date_to_date(45480), -- expected_delivery_date
    excel_date_to_date(45480), -- actual_delivery_date
    'Inventory purchase - Class B-321 products',
    (SELECT id FROM users WHERE username = 'admin'),
    'Admin User',
    NOW(),
    NOW()
)

ON CONFLICT (purchase_number) DO NOTHING;

-- =====================================================
-- 2. PURCHASE ITEMS (Individual items in each purchase)
-- =====================================================

-- Insert purchase items for each purchase order
INSERT INTO purchase_items (
    id,
    purchase_id,
    product_id,
    product_name,
    product_sku,
    quantity,
    unit_cost,
    total_cost,
    received_quantity,
    notes
) VALUES
-- Purchase Order 1 Items: Class A and B
(
    gen_random_uuid(),
    (SELECT id FROM purchases WHERE purchase_number = 'PO-2025-04-09-001'),
    (SELECT id FROM products WHERE sku = 'INV-CLASS-A'),
    'inventory class A',
    'INV-CLASS-A',
    100,
    395.00,
    39500.00,
    100,
    'Premium inventory class A products'
),
(
    gen_random_uuid(),
    (SELECT id FROM purchases WHERE purchase_number = 'PO-2025-04-09-001'),
    (SELECT id FROM products WHERE sku = 'INV-CLASS-B'),
    'inventory class B',
    'INV-CLASS-B',
    100,
    310.00,
    31000.00,
    100,
    'Standard inventory class B products'
),

-- Purchase Order 2 Items: Class B-300 and C
(
    gen_random_uuid(),
    (SELECT id FROM purchases WHERE purchase_number = 'PO-2025-05-10-001'),
    (SELECT id FROM products WHERE sku = 'INV-CLASS-B-300'),
    'inventory class B-300',
    'INV-CLASS-B-300',
    42,
    300.00,
    12600.00,
    42,
    'Special inventory class B-300 products'
),
(
    gen_random_uuid(),
    (SELECT id FROM purchases WHERE purchase_number = 'PO-2025-05-10-001'),
    (SELECT id FROM products WHERE sku = 'INV-CLASS-C'),
    'Inventory class C',
    'INV-CLASS-C',
    158,
    200.00,
    31600.00,
    158,
    'Economy inventory class C products'
),

-- Purchase Order 3 Items: Class B-hanen
(
    gen_random_uuid(),
    (SELECT id FROM purchases WHERE purchase_number = 'PO-2025-06-02-001'),
    (SELECT id FROM products WHERE sku = 'INV-CLASS-B-HANEN'),
    'inventory class B-hanen',
    'INV-CLASS-B-HANEN',
    257,
    315.00,
    80900.00,
    257,
    'Special inventory class B-hanen products'
),

-- Purchase Order 4 Items: Class B-321
(
    gen_random_uuid(),
    (SELECT id FROM purchases WHERE purchase_number = 'PO-2025-06-19-001'),
    (SELECT id FROM products WHERE sku = 'INV-CLASS-B-321'),
    'inventory class B-321',
    'INV-CLASS-B-321',
    128,
    321.35,
    41133.00,
    128,
    'Special inventory class B-321 products'
);

-- =====================================================
-- 3. UPDATE PRODUCT STOCK LEVELS
-- =====================================================

-- Update product stock levels based on received quantities
UPDATE products 
SET stock = stock + received_qty
FROM (
    SELECT 
        pi.product_id,
        SUM(pi.received_quantity) as received_qty
    FROM purchase_items pi
    JOIN purchases p ON pi.purchase_id = p.id
    WHERE p.purchase_status = 'RECEIVED'
    GROUP BY pi.product_id
) as received_stock
WHERE products.id = received_stock.product_id;

-- =====================================================
-- 4. VERIFICATION QUERIES
-- =====================================================

-- Check inserted purchases
SELECT '=== PURCHASES INSERTED ===' as section;
SELECT 
    purchase_number,
    supplier_id,
    total_amount,
    purchase_status,
    payment_status,
    order_date,
    expected_delivery_date,
    actual_delivery_date
FROM purchases 
WHERE purchase_number LIKE 'PO-2025-%'
ORDER BY order_date;

-- Check purchase items
SELECT '=== PURCHASE ITEMS INSERTED ===' as section;
SELECT 
    pi.product_sku,
    pi.product_name,
    pi.quantity,
    pi.unit_cost,
    pi.total_cost,
    pi.received_quantity,
    p.purchase_number
FROM purchase_items pi
JOIN purchases p ON pi.purchase_id = p.id
WHERE p.purchase_number LIKE 'PO-2025-%'
ORDER BY p.purchase_number, pi.product_sku;

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
    'Purchases' as entity,
    COUNT(*) as count
FROM purchases 
WHERE purchase_number LIKE 'PO-2025-%'

UNION ALL

SELECT 
    'Purchase Items' as entity,
    COUNT(*) as count
FROM purchase_items pi
JOIN purchases p ON pi.purchase_id = p.id
WHERE p.purchase_number LIKE 'PO-2025-%'

UNION ALL

SELECT 
    'Total Purchase Value' as entity,
    SUM(total_amount) as count
FROM purchases 
WHERE purchase_number LIKE 'PO-2025-%';

-- =====================================================
-- 5. CLEANUP (Optional - remove helper function)
-- =====================================================

-- Uncomment the line below if you want to remove the helper function
-- DROP FUNCTION IF EXISTS excel_date_to_date(NUMERIC);

-- =====================================================
-- END OF SCRIPT
-- =====================================================
-- This script has successfully inserted all purchase data from your JSON
-- The purchases include:
-- 1. PO-2025-04-09-001: Class A (100 units) + Class B (100 units) = 70,500 EGP
-- 2. PO-2025-05-10-001: Class B-300 (42 units) + Class C (158 units) = 44,200 EGP  
-- 3. PO-2025-06-02-001: Class B-hanen (257 units) = 80,900 EGP
-- 4. PO-2025-06-19-001: Class B-321 (128 units) = 41,133 EGP
-- Total: 236,733 EGP in purchases 