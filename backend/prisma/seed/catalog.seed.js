// ─── Catalog Seed (Owner: Member B) ──────────────────────────────────────────
// Seeds: Products + Variants, Plans, Quotation Templates, Subscriptions
// All upserts are idempotent — safe to re-run.
// Depends on: auth seed must run first (needs customer user IDs).
// ─────────────────────────────────────────────────────────────────────────────

export default async function seedCatalog(prisma) {
  console.log('  Seeding products…');
  await seedProducts(prisma);

  console.log('  Seeding plans…');
  await seedPlans(prisma);

  console.log('  Seeding quotation templates…');
  await seedTemplates(prisma);

  console.log('  Seeding subscriptions…');
  await seedSubscriptions(prisma);

  console.log('  ✅ Catalog seed complete');
}

// ─────────────────────────────────────────────────────────────────────────────
async function seedProducts(prisma) {
  const products = [
    { name: 'Odoo ERP Core',          type: 'Service',  salesPrice: 25000, costPrice: 8000,  notes: 'Full ERP suite with core modules',
      variants: [
        { attribute: 'Edition', value: 'Community',   extraPrice: 0 },
        { attribute: 'Edition', value: 'Enterprise',  extraPrice: 15000 },
      ],
    },
    { name: 'CRM Module',              type: 'Service',  salesPrice: 8000,  costPrice: 2500,  notes: 'Customer relationship management module',   variants: [] },
    { name: 'HR & Payroll Module',     type: 'Service',  salesPrice: 12000, costPrice: 4000,  notes: 'HR, attendance, payroll automation',
      variants: [
        { attribute: 'Seats', value: 'Up to 50',  extraPrice: 0 },
        { attribute: 'Seats', value: 'Up to 200', extraPrice: 4000 },
      ],
    },
    { name: 'Inventory & WMS',         type: 'Service',  salesPrice: 10000, costPrice: 3000,  notes: 'Warehouse & inventory management',          variants: [] },
    { name: 'Accounting Module',       type: 'Service',  salesPrice: 9000,  costPrice: 3000,  notes: 'Full accounting, GST, TDS compliance',
      variants: [
        { attribute: 'Brand', value: 'Odoo', extraPrice: 0 },
        { attribute: 'Brand', value: 'Zoho', extraPrice: 560 },
      ],
    },
    { name: 'E-Commerce Module',       type: 'Service',  salesPrice: 7500,  costPrice: 2200,  notes: 'Online storefront integration',             variants: [] },
    { name: 'Project Management',      type: 'Service',  salesPrice: 6000,  costPrice: 1800,  notes: 'Task and project tracking',                variants: [] },
    { name: 'Manufacturing Module',    type: 'Service',  salesPrice: 14000, costPrice: 5000,  notes: 'Production, BOM, work orders',             variants: [] },
    { name: 'Email Marketing',         type: 'Service',  salesPrice: 4500,  costPrice: 1200,  notes: 'Bulk email campaigns and automation',
      variants: [
        { attribute: 'Contacts', value: '10K', extraPrice: 0 },
        { attribute: 'Contacts', value: '50K', extraPrice: 2000 },
      ],
    },
    { name: 'Helpdesk & Tickets',      type: 'Service',  salesPrice: 5500,  costPrice: 1600,  notes: 'Customer support ticketing system',         variants: [] },
    { name: 'Cloud Hosting - Basic',   type: 'Product',  salesPrice: 3000,  costPrice: 1200,  notes: '2vCPU, 4GB RAM, 50GB SSD',                 variants: [] },
    { name: 'Cloud Hosting - Pro',     type: 'Product',  salesPrice: 8000,  costPrice: 3500,  notes: '4vCPU, 16GB RAM, 200GB SSD',               variants: [] },
    { name: 'SSL Certificate',         type: 'Product',  salesPrice: 1200,  costPrice: 400,   notes: 'Annual wildcard SSL certificate',           variants: [] },
    { name: 'Implementation Services', type: 'Service',  salesPrice: 35000, costPrice: 15000, notes: 'On-site setup and configuration',
      variants: [
        { attribute: 'Duration', value: '1 Week',  extraPrice: 0 },
        { attribute: 'Duration', value: '2 Weeks', extraPrice: 20000 },
      ],
    },
    { name: 'Training Package',        type: 'Service',  salesPrice: 18000, costPrice: 7000,  notes: '20 hrs of user and admin training',         variants: [] },
    { name: 'Annual Support SLA',      type: 'Service',  salesPrice: 22000, costPrice: 8500,  notes: 'Priority support, 4-hr SLA',
      variants: [
        { attribute: 'Priority', value: 'Standard', extraPrice: 0 },
        { attribute: 'Priority', value: 'Premium',  extraPrice: 8000 },
      ],
    },
    { name: 'Custom Dev - 10hrs',      type: 'Service',  salesPrice: 15000, costPrice: 6000,  notes: 'Custom development hours block',            variants: [] },
    { name: 'Data Migration',          type: 'Service',  salesPrice: 12000, costPrice: 5000,  notes: 'Legacy data import and cleanup',            variants: [] },
    { name: 'Mobile App Access',       type: 'Service',  salesPrice: 3500,  costPrice: 1000,  notes: 'iOS & Android companion app licence',       variants: [] },
    { name: 'API Integration Pack',    type: 'Service',  salesPrice: 9500,  costPrice: 3500,  notes: 'REST API access + 10 integration slots',   variants: [] },
    { name: 'Backup & DR Service',     type: 'Product',  salesPrice: 5000,  costPrice: 2000,  notes: 'Daily offsite backup with disaster recovery', variants: [] },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name:       p.name,
          type:       p.type,
          salesPrice: p.salesPrice,
          costPrice:  p.costPrice,
          notes:      p.notes,
          variants:   { create: p.variants },
        },
      });
      console.log(`    ✅ Product: ${p.name}`);
    } else {
      console.log(`    ⏭️  Skipped (exists): ${p.name}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
async function seedPlans(prisma) {
  const plans = [
    { name: 'Starter',      price: 9900,   billingPeriod: 'MONTHLY', minQuantity: 1, availableFrom: new Date('2024-01-01'), availableTo: null,               autoClose: false, closableEarly: true,  pausable: true,  renewable: true  },
    { name: 'Growth',       price: 24900,  billingPeriod: 'MONTHLY', minQuantity: 1, availableFrom: new Date('2024-01-01'), availableTo: null,               autoClose: false, closableEarly: true,  pausable: true,  renewable: true  },
    { name: 'Enterprise',   price: 59900,  billingPeriod: 'MONTHLY', minQuantity: 1, availableFrom: new Date('2024-01-01'), availableTo: null,               autoClose: false, closableEarly: true,  pausable: true,  renewable: true  },
    { name: 'Annual Starter', price: 99000, billingPeriod: 'YEARLY', minQuantity: 1, availableFrom: new Date('2024-01-01'), availableTo: null,               autoClose: true,  closableEarly: false, pausable: false, renewable: true  },
    { name: 'Annual Growth', price: 249000, billingPeriod: 'YEARLY', minQuantity: 1, availableFrom: new Date('2024-01-01'), availableTo: null,               autoClose: true,  closableEarly: false, pausable: false, renewable: true  },
    { name: 'Weekly Dev',   price: 3500,   billingPeriod: 'WEEKLY',  minQuantity: 1, availableFrom: new Date('2024-06-01'), availableTo: new Date('2025-12-31'), autoClose: true, closableEarly: true, pausable: true,  renewable: true  },
  ];

  for (const pl of plans) {
    const existing = await prisma.plan.findFirst({ where: { name: pl.name } });
    if (!existing) {
      await prisma.plan.create({ data: pl });
      console.log(`    ✅ Plan: ${pl.name}`);
    } else {
      console.log(`    ⏭️  Skipped (exists): ${pl.name}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
async function seedTemplates(prisma) {
  // Fetch all plans and products by name for FK resolution
  const planMap    = Object.fromEntries((await prisma.plan.findMany()).map((p) => [p.name, p.id]));
  const productMap = Object.fromEntries((await prisma.product.findMany()).map((p) => [p.name, p.id]));

  const templates = [
    {
      name: 'Standard Starter Template', plan: 'Starter', validityDays: 30,
      lines: [
        { product: 'Odoo ERP Core',        qty: 1 },
        { product: 'Cloud Hosting - Basic', qty: 1 },
      ],
    },
    {
      name: 'Growth Bundle Template', plan: 'Growth', validityDays: 30,
      lines: [
        { product: 'Odoo ERP Core',      qty: 1 },
        { product: 'CRM Module',         qty: 1 },
        { product: 'Cloud Hosting - Pro', qty: 1 },
      ],
    },
    {
      name: 'Enterprise Full Stack', plan: 'Enterprise', validityDays: 15,
      lines: [
        { product: 'Odoo ERP Core',          qty: 1 },
        { product: 'Manufacturing Module',    qty: 1 },
        { product: 'Implementation Services', qty: 1 },
        { product: 'Annual Support SLA',      qty: 1 },
      ],
    },
    {
      name: 'HR & Payroll Quick-Start', plan: 'Starter', validityDays: 14,
      lines: [
        { product: 'HR & Payroll Module', qty: 1 },
        { product: 'Training Package',    qty: 1 },
      ],
    },
    {
      name: 'E-Commerce Accelerator', plan: 'Growth', validityDays: 21,
      lines: [
        { product: 'E-Commerce Module', qty: 1 },
        { product: 'Email Marketing',   qty: 1 },
        { product: 'Cloud Hosting - Pro', qty: 1 },
      ],
    },
  ];

  for (const t of templates) {
    const existing = await prisma.quotationTemplate.findFirst({ where: { name: t.name } });
    if (!existing) {
      const planId = planMap[t.plan];
      if (!planId) { console.log(`    ⚠️  Plan "${t.plan}" not found, skipping template ${t.name}`); continue; }

      await prisma.quotationTemplate.create({
        data: {
          name:         t.name,
          planId,
          validityDays: t.validityDays,
          lines: {
            create: t.lines
              .filter((l) => productMap[l.product])
              .map((l) => ({
                productId: productMap[l.product],
                quantity:  l.qty,
              })),
          },
        },
      });
      console.log(`    ✅ Template: ${t.name}`);
    } else {
      console.log(`    ⏭️  Skipped (exists): ${t.name}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
async function seedSubscriptions(prisma) {
  // Check if any subscriptions already exist
  const count = await prisma.subscription.count();
  if (count > 0) {
    console.log(`    ⏭️  Subscriptions already seeded (${count} exist)`);
    return;
  }

  // Get customers seeded by auth seed
  const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER' }, take: 5 });
  if (customers.length === 0) {
    console.log('    ⚠️  No customers found — skipping subscription seed. Run auth seed first.');
    return;
  }

  const planMap     = Object.fromEntries((await prisma.plan.findMany()).map((p) => [p.name, p]));
  const productMap  = Object.fromEntries((await prisma.product.findMany()).map((p) => [p.name, p]));
  const templateMap = Object.fromEntries((await prisma.quotationTemplate.findMany()).map((t) => [t.name, t]));

  const subs = [
    {
      customer: customers[0], plan: 'Enterprise', template: 'Enterprise Full Stack',
      status: 'ACTIVE', startDate: '2024-01-15', expiryDate: '2025-01-14',
      paymentTerms: 'Net 30',
      lines: [
        { product: 'Odoo ERP Core', qty: 1, tax: 18 },
        { product: 'Manufacturing Module', qty: 1, tax: 18 },
        { product: 'Annual Support SLA', qty: 1, tax: 18 },
      ],
    },
    {
      customer: customers[1], plan: 'Growth', template: 'Growth Bundle Template',
      status: 'ACTIVE', startDate: '2024-03-01', expiryDate: '2025-02-28',
      paymentTerms: 'Net 15',
      lines: [
        { product: 'Odoo ERP Core', qty: 1, tax: 18 },
        { product: 'CRM Module', qty: 1, tax: 18 },
      ],
    },
    {
      customer: customers[2], plan: 'Starter', template: 'Standard Starter Template',
      status: 'CONFIRMED', startDate: '2024-04-10', expiryDate: '2025-04-09',
      paymentTerms: 'Net 30',
      lines: [
        { product: 'Odoo ERP Core', qty: 1, tax: 18 },
        { product: 'Cloud Hosting - Basic', qty: 1, tax: 18 },
      ],
    },
    {
      customer: customers[3], plan: 'Growth', template: 'Growth Bundle Template',
      status: 'DRAFT', startDate: '2024-05-01', expiryDate: '2025-04-30',
      paymentTerms: 'Net 30',
      lines: [
        { product: 'CRM Module', qty: 1, tax: 18 },
        { product: 'HR & Payroll Module', qty: 1, tax: 18 },
      ],
    },
    {
      customer: customers[4], plan: 'Enterprise', template: 'Enterprise Full Stack',
      status: 'ACTIVE', startDate: '2024-06-15', expiryDate: '2025-06-14',
      paymentTerms: 'Net 45',
      lines: [
        { product: 'Odoo ERP Core', qty: 1, tax: 18 },
        { product: 'Implementation Services', qty: 1, tax: 18 },
      ],
    },
  ];

  let seq = 0;
  for (const s of subs) {
    seq++;
    const plan = planMap[s.plan];
    if (!plan) continue;

    const template = s.template ? templateMap[s.template] : null;
    const number   = `SUB-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`;

    const lines = s.lines
      .filter((l) => productMap[l.product])
      .map((l) => {
        const prod   = productMap[l.product];
        const amount = l.qty * Number(prod.salesPrice) * (1 + l.tax / 100);
        return {
          productId: prod.id,
          quantity:  l.qty,
          unitPrice: Number(prod.salesPrice),
          amount:    parseFloat(amount.toFixed(2)),
        };
      });

    await prisma.subscription.create({
      data: {
        number,
        customerId:   s.customer.id,
        planId:       plan.id,
        templateId:   template?.id || null,
        status:       s.status,
        startDate:    new Date(s.startDate),
        expiryDate:   new Date(s.expiryDate),
        paymentTerms: s.paymentTerms,
        lines:        { create: lines },
      },
    });

    // Upsert counter to avoid duplicate numbers on next seed
    await prisma.counter.upsert({
      where:  { key: 'SUB' },
      create: { key: 'SUB', value: seq },
      update: { value: seq },
    });

    console.log(`    ✅ Subscription: ${number} (${s.customer.name} / ${s.plan})`);
  }
}
