import React, { useRef } from 'react';
import { Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import type { Invoice } from '@features/sales/types';
import type { Settings } from '@features/settings/types';
import dayjs from 'dayjs';

interface PrintInvoiceProps {
  invoice: Invoice;
  settings?: Settings;
  buttonType?: 'primary' | 'text' | 'default';
  showText?: boolean;
}

export const PrintInvoice: React.FC<PrintInvoiceProps> = ({ 
  invoice, 
  settings,
  buttonType = 'primary',
  showText = true,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #333;
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 2px solid #333;
            }
            .company-info {
              flex: 1;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .invoice-info {
              text-align: right;
            }
            .invoice-title {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .invoice-number {
              font-size: 18px;
              margin-bottom: 5px;
            }
            .invoice-details {
              display: flex;
              justify-content: space-between;
              margin-bottom: 40px;
            }
            .client-info, .invoice-meta {
              flex: 1;
            }
            .section-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #666;
            }
            .section-content {
              font-size: 14px;
              line-height: 1.6;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #f5f5f5;
              padding: 12px;
              text-align: left;
              font-weight: bold;
              border-bottom: 2px solid #333;
            }
            td {
              padding: 10px 12px;
              border-bottom: 1px solid #ddd;
            }
            .text-right {
              text-align: right;
            }
            .text-center {
              text-align: center;
            }
            .totals {
              margin-left: auto;
              width: 300px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
            }
            .total-row.total {
              font-size: 18px;
              font-weight: bold;
              border-top: 2px solid #333;
              padding-top: 12px;
              margin-top: 8px;
            }
            .notes {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
            .notes-title {
              font-weight: bold;
              margin-bottom: 10px;
            }
            .footer {
              margin-top: 60px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body {
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const formatCurrency = (amount: number) => {
    const currency = settings?.currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return dayjs(date).format('MMMM DD, YYYY');
  };

  return (
    <>
      <div className="no-print">
        <Button
          type={buttonType}
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          className={buttonType === 'primary' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          {showText && 'Print Invoice'}
        </Button>
      </div>
      <div ref={printRef} style={{ display: 'none' }}>
        <div className="invoice-header">
          <div className="company-info">
            <div className="company-name">{settings?.companyName || 'Company Name'}</div>
            {settings?.companyAddress && (
              <div className="section-content">{settings.companyAddress}</div>
            )}
            {settings?.companyPhone && (
              <div className="section-content">Phone: {settings.companyPhone}</div>
            )}
            {settings?.companyEmail && (
              <div className="section-content">Email: {settings.companyEmail}</div>
            )}
            {settings?.companyTaxId && (
              <div className="section-content">Tax ID: {settings.companyTaxId}</div>
            )}
          </div>
          <div className="invoice-info">
            <div className="invoice-title">INVOICE</div>
            <div className="invoice-number">Invoice #: {invoice.invoiceNumber}</div>
            <div>Date: {formatDate(invoice.issueDate)}</div>
            <div>Due Date: {formatDate(invoice.dueDate)}</div>
          </div>
        </div>

        <div className="invoice-details">
          <div className="client-info">
            <div className="section-title">Bill To:</div>
            <div className="section-content">
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                {invoice.clientName}
              </div>
              {invoice.clientAddress && <div>{invoice.clientAddress}</div>}
              {invoice.clientEmail && <div>Email: {invoice.clientEmail}</div>}
              {invoice.clientPhone && <div>Phone: {invoice.clientPhone}</div>}
            </div>
          </div>
          <div className="invoice-meta">
            <div className="section-title">Payment Terms:</div>
            <div className="section-content">{invoice.paymentTerms}</div>
            <div className="section-title" style={{ marginTop: '15px' }}>Status:</div>
            <div className="section-content">{invoice.paymentStatus}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th className="text-center">SKU</th>
              <th className="text-center">Qty</th>
              <th className="text-right">Unit Price</th>
              <th className="text-right">Discount</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id || index}>
                <td>{item.productName}</td>
                <td className="text-center">{item.productSku}</td>
                <td className="text-center">{item.quantity || 1}</td>
                <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="text-right">
                  {item.discount ? `${item.discount}%` : '-'}
                </td>
                <td className="text-right">{formatCurrency(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="totals">
          <div className="total-row">
            <span>Subtotal:</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="total-row">
              <span>Discount:</span>
              <span>-{formatCurrency(invoice.discountAmount)}</span>
            </div>
          )}
          {invoice.taxAmount > 0 && (
            <div className="total-row">
              <span>Tax:</span>
              <span>{formatCurrency(invoice.taxAmount)}</span>
            </div>
          )}
          <div className="total-row total">
            <span>Total Amount:</span>
            <span>{formatCurrency(invoice.totalAmount)}</span>
          </div>
          <div className="total-row">
            <span>Paid Amount:</span>
            <span>{formatCurrency(invoice.paidAmount)}</span>
          </div>
          <div className="total-row">
            <span>Remaining:</span>
            <span>{formatCurrency(invoice.remainingAmount)}</span>
          </div>
        </div>

        {invoice.notes && (
          <div className="notes">
            <div className="notes-title">Notes:</div>
            <div className="section-content">{invoice.notes}</div>
          </div>
        )}

        {settings?.invoiceFooter && (
          <div className="footer">{settings.invoiceFooter}</div>
        )}
      </div>
    </>
  );
};

