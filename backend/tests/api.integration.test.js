// ─── API Integration Test Suite (Member C) ───────────────────────────────────
// Tests HTTP API endpoints with real JWT authentication & RBAC.
// ─────────────────────────────────────────────────────────────────────────────
import express from 'express';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
    throw new Error(message);
  } else {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  }
}

async function runApiTests() {
  console.log('\n🌐 Running Member C: Billing HTTP API Integration Tests...\n');

  // Start temporary server on an ephemeral port
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  try {
    // 1. Log in as ADMIN
    console.log('--- STEP 1: Authentication ---');
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@brightloop.com', password: 'Admin@12345' }),
    });
    const adminLoginJson = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminLoginJson.success, 'Admin login succeeded');
    const adminToken = adminLoginJson.data.token;

    // Log in as CUSTOMER
    const custLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'arjun@techcorp.in', password: 'Customer@123' }),
    });
    const custLoginJson = await custLoginRes.json();
    assert(custLoginRes.status === 200 && custLoginJson.success, 'Customer login succeeded');
    const custToken = custLoginJson.data.token;
    const custId = custLoginJson.data.user.id;

    // 2. Taxes Endpoints (Admin)
    console.log('\n--- STEP 2: Taxes Endpoints ---');
    const taxesRes = await fetch(`${baseUrl}/billing/taxes`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const taxesJson = await taxesRes.json();
    assert(taxesRes.status === 200 && Array.isArray(taxesJson.data), 'GET /api/billing/taxes returned array of taxes');

    // Create Tax
    const createTaxRes = await fetch(`${baseUrl}/billing/taxes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Municipal Surcharge 2%',
        percentage: 2,
        appliesToAll: true,
      }),
    });
    const createTaxJson = await createTaxRes.json();
    assert(createTaxRes.status === 201 && createTaxJson.data.name === 'Municipal Surcharge 2%', 'POST /api/billing/taxes created new tax');
    const createdTaxId = createTaxJson.data.id;

    // RBAC check: Customer cannot create tax (should be 403)
    const custCreateTaxRes = await fetch(`${baseUrl}/billing/taxes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`,
      },
      body: JSON.stringify({ name: 'Hacked Tax', percentage: 0 }),
    });
    assert(custCreateTaxRes.status === 403, 'Customer correctly forbidden (403) from creating tax');

    // Clean up created tax
    await fetch(`${baseUrl}/billing/taxes/${createdTaxId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    // 3. Discounts Endpoints
    console.log('\n--- STEP 3: Discounts Endpoints ---');
    const discountsRes = await fetch(`${baseUrl}/billing/discounts`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const discountsJson = await discountsRes.json();
    assert(discountsRes.status === 200 && Array.isArray(discountsJson.data), 'GET /api/billing/discounts returned array of discounts');

    // RBAC check: Customer cannot manage discounts
    const custDiscRes = await fetch(`${baseUrl}/billing/discounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`,
      },
      body: JSON.stringify({ name: 'Fake Discount', type: 'percentage', value: 99 }),
    });
    assert(custDiscRes.status === 403, 'Customer correctly forbidden (403) from managing discounts');

    // 4. Invoices Endpoints
    console.log('\n--- STEP 4: Invoices Endpoints ---');
    const invoicesRes = await fetch(`${baseUrl}/billing/invoices`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const invoicesJson = await invoicesRes.json();
    assert(invoicesRes.status === 200 && Array.isArray(invoicesJson.data), 'GET /api/billing/invoices returned array');
    assert(invoicesJson.data.length > 0, `Invoices exist in system (${invoicesJson.data.length} found)`);

    const firstInvoice = invoicesJson.data[0];

    // Single invoice detail
    const detailRes = await fetch(`${baseUrl}/billing/invoices/${firstInvoice.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const detailJson = await detailRes.json();
    assert(detailRes.status === 200 && detailJson.data.number === firstInvoice.number, 'GET /api/billing/invoices/:id returned full details');

    // Invoice PDF / HTML view
    const pdfRes = await fetch(`${baseUrl}/billing/invoices/${firstInvoice.id}/pdf`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(pdfRes.status === 200, 'GET /api/billing/invoices/:id/pdf returned 200 OK');
    const pdfHtml = await pdfRes.text();
    assert(pdfHtml.includes('Brightloop') && pdfHtml.includes(firstInvoice.number), 'PDF HTML includes branding and invoice number');

    // Invoice Email Sending
    const sendRes = await fetch(`${baseUrl}/billing/invoices/${firstInvoice.id}/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const sendJson = await sendRes.json();
    assert(sendRes.status === 200 && sendJson.success, 'POST /api/billing/invoices/:id/send succeeded');

    // Customer scoping: Customer only sees their own invoices
    const custInvoicesRes = await fetch(`${baseUrl}/billing/invoices`, {
      headers: { Authorization: `Bearer ${custToken}` },
    });
    const custInvoicesJson = await custInvoicesRes.json();
    assert(custInvoicesRes.status === 200 && Array.isArray(custInvoicesJson.data), 'Customer can access /billing/invoices');
    const allBelongToCustomer = custInvoicesJson.data.every((inv) => inv.customerId === custId);
    assert(allBelongToCustomer, 'Every invoice returned to customer belongs strictly to their customer ID (scoped)');

    console.log(`\n========================================`);
    console.log(`API TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
  }
}

runApiTests().catch((e) => {
  console.error('Fatal API test error:', e);
  process.exit(1);
});
