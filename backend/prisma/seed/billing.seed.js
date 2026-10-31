// ─── Billing Seed (Owner: Member C) ──────────────────────────────────────────
// Seeds: Standard Tax Rates (GST, TDS) and Discount Campaigns
// Idempotent: checks for existing names/codes before inserting.
// ─────────────────────────────────────────────────────────────────────────────

export default async function seedBilling(prisma) {
  console.log('  Seeding taxes…');
  await seedTaxes(prisma);

  console.log('  Seeding discounts…');
  await seedDiscounts(prisma);

  console.log('  ✅ Billing seed complete');
}

async function seedTaxes(prisma) {
  const taxes = [
    { name: 'GST 18%',  percentage: 18.00, appliesToAll: true,  isActive: true },
    { name: 'GST 12%',  percentage: 12.00, appliesToAll: false, isActive: true },
    { name: 'GST 5%',   percentage: 5.00,  appliesToAll: false, isActive: true },
    { name: 'TDS 10%',  percentage: 10.00, appliesToAll: false, isActive: true },
    { name: 'IGST 18%', percentage: 18.00, appliesToAll: false, isActive: true },
    { name: 'CESS 1%',  percentage: 1.00,  appliesToAll: false, isActive: false },
  ];

  for (const t of taxes) {
    const existing = await prisma.tax.findFirst({ where: { name: t.name } });
    if (!existing) {
      await prisma.tax.create({ data: t });
      console.log(`    ✅ Tax: ${t.name} (${t.percentage}%)`);
    } else {
      console.log(`    ⏭️  Skipped (exists): ${t.name}`);
    }
  }
}

async function seedDiscounts(prisma) {
  const discounts = [
    {
      name: 'New Customer 10%',
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10.00,
      minPurchase: 10000.00,
      minQuantity: null,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2026-12-31'),
      usageLimit: 100,
      usedCount: 0,
      appliesTo: 'SUBSCRIPTION',
      isActive: true,
    },
    {
      name: 'Enterprise Flat Off',
      code: 'ENTERPRISE5K',
      type: 'FIXED',
      value: 5000.00,
      minPurchase: 80000.00,
      minQuantity: null,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2026-12-31'),
      usageLimit: 50,
      usedCount: 0,
      appliesTo: 'SUBSCRIPTION',
      isActive: true,
    },
    {
      name: 'Annual Pre-pay 15%',
      code: 'ANNUAL15',
      type: 'PERCENTAGE',
      value: 15.00,
      minPurchase: null,
      minQuantity: 1,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2026-12-31'),
      usageLimit: 100,
      usedCount: 0,
      appliesTo: 'SUBSCRIPTION',
      isActive: true,
    },
    {
      name: 'Referral Bonus ₹2000',
      code: 'REF2000',
      type: 'FIXED',
      value: 2000.00,
      minPurchase: null,
      minQuantity: 1,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2026-12-31'),
      usageLimit: 200,
      usedCount: 0,
      appliesTo: 'SUBSCRIPTION',
      isActive: true,
    },
  ];

  for (const d of discounts) {
    const existing = await prisma.discount.findFirst({ where: { name: d.name } });
    if (!existing) {
      await prisma.discount.create({ data: d });
      console.log(`    ✅ Discount: ${d.name} (${d.type === 'FIXED' ? '₹' + d.value : d.value + '%'})`);
    } else {
      console.log(`    ⏭️  Skipped (exists): ${d.name}`);
    }
  }
}
