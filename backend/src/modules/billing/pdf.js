// ─── Invoice PDF / Print Document Builder (Member C) ──────────────────────────
// Generates clean, production-styled HTML documents formatted for PDF printing.
// ─────────────────────────────────────────────────────────────────────────────

export function generateInvoiceHtml(invoice) {
  const linesHtml = (invoice.lines || []).map((line, idx) => `
    <tr style="border-bottom: 1px solid #EADFCB;">
      <td style="padding: 12px 8px; font-weight: 500; color: #1E1B2E;">${line.product || line.description}</td>
      <td style="padding: 12px 8px; text-align: center; color: #6B667A;">${line.qty || line.quantity}</td>
      <td style="padding: 12px 8px; color: #6B667A;">₹${Number(line.unitPrice).toFixed(2)}</td>
      <td style="padding: 12px 8px; color: #6B667A;">${line.tax || line.taxPercent}%</td>
      <td style="padding: 12px 8px; text-align: right; font-weight: 600; color: #1E1B2E;">₹${Number(line.amount).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Invoice ${invoice.number}</title>
  <style>
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      background: #FBF6EC;
      color: #1E1B2E;
      margin: 0;
      padding: 40px 20px;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #FFFDF8;
      border: 1px solid #EADFCB;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 32px;
      border-bottom: 2px solid #EADFCB;
      padding-bottom: 24px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand h2 {
      margin: 0;
      color: #0E5A55;
      font-size: 24px;
      font-weight: 800;
    }
    .inv-meta {
      text-align: right;
    }
    .inv-title {
      font-size: 32px;
      font-weight: 900;
      color: #D6CEBE;
      margin: 0 0 8px 0;
    }
    .bill-to {
      background: #FBF6EC;
      border: 1px solid #EADFCB;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 28px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      color: #6B667A;
      border-bottom: 2px solid #EADFCB;
      padding: 8px;
    }
    .totals {
      display: flex;
      justify-content: flex-end;
    }
    .totals-box {
      width: 260px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      color: #6B667A;
      font-size: 14px;
    }
    .grand-total {
      border-top: 2px solid #1E1B2E;
      color: #0E5A55;
      font-size: 18px;
      font-weight: 800;
      padding-top: 10px;
      margin-top: 6px;
    }
    @media print {
      body { background: white; padding: 0; }
      .invoice-card { border: none; box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#0E5A55"/>
            <path d="M16 8C11.6 8 8 11.6 8 16s3.6 8 8 8c2.4 0 4.5-1 6-2.6" stroke="#DDF0EA" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M20 5.5l3 3-3 3" stroke="#F6B73C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h2>Brightloop</h2>
        </div>
        <p style="color: #6B667A; font-size: 12px; margin-top: 8px; line-height: 1.5;">
          123 Tech Park, Koramangala<br>
          Bengaluru, Karnataka 560034<br>
          GSTIN: 29AAXCB1234C1Z5<br>
          billing@brightloop.io
        </p>
      </div>
      <div class="inv-meta">
        <div class="inv-title">INVOICE</div>
        <div style="font-weight: 700; font-size: 16px;">#${invoice.number}</div>
        <div style="color: #6B667A; font-size: 12px; margin-top: 4px;">Issue: ${invoice.issueDate}</div>
        <div style="color: #6B667A; font-size: 12px;">Due: ${invoice.dueDate}</div>
        <div style="margin-top: 6px;">
          <span style="display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #DDF0EA; color: #0E5A55;">
            ${invoice.status}
          </span>
        </div>
      </div>
    </div>

    <div class="bill-to">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6B667A; margin-bottom: 4px;">Bill To</div>
      <div style="font-weight: 700; font-size: 16px;">${invoice.customerName}</div>
      <div style="color: #6B667A; font-size: 13px;">${invoice.customerEmail || ''}</div>
      <div style="color: #6B667A; font-size: 12px; margin-top: 4px;">Subscription #${invoice.subscriptionNumber || invoice.subscriptionId}</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Qty</th>
          <th>Unit Price</th>
          <th>Tax</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${linesHtml}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-box">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>₹${Number(invoice.subtotal).toFixed(2)}</span>
        </div>
        ${invoice.discount > 0 ? `
          <div class="totals-row" style="color: #0E5A55;">
            <span>Discount</span>
            <span>-₹${Number(invoice.discount).toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="totals-row">
          <span>Tax</span>
          <span>₹${Number(invoice.tax).toFixed(2)}</span>
        </div>
        <div class="totals-row grand-total">
          <span>Total</span>
          <span>₹${Number(invoice.total).toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #EADFCB; font-size: 12px; color: #6B667A;">
      <p style="margin: 0;">Thank you for your business. For payment queries, please reach out to billing@brightloop.io.</p>
    </div>
  </div>
</body>
</html>
  `;
}
