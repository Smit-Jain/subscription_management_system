// ─── Auth Seed ───────────────────────────────────────────────────────────────
// Creates the default admin, 2 staff, and 5 customers. Idempotent via upsert.
// ─────────────────────────────────────────────────────────────────────────────
import bcrypt from 'bcryptjs';

export default async function seedAuth(prisma) {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@brightloop.com').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

  const hash = (pw) => bcrypt.hashSync(pw, rounds);

  // Default admin
  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      name: 'Deepa Nambiar',
      email: adminEmail,
      passwordHash: hash(adminPassword),
      role: 'ADMIN',
      phone: '+91 98100 00001',
      isActive: true,
    },
    update: {},
  });
  console.log(`  ✅ Admin: ${adminEmail}`);

  // Staff users
  const staffUsers = [
    { name: 'Rahul Sharma', email: 'rahul@brightloop.com', phone: '+91 98100 00010', password: 'Staff@12345' },
    { name: 'Priya Menon',  email: 'priya@brightloop.com', phone: '+91 98100 00011', password: 'Staff@12345' },
  ];

  for (const s of staffUsers) {
    await prisma.user.upsert({
      where: { email: s.email },
      create: {
        name: s.name,
        email: s.email,
        passwordHash: hash(s.password),
        role: 'STAFF',
        phone: s.phone,
        isActive: true,
      },
      update: {},
    });
    console.log(`  ✅ Staff: ${s.email}`);
  }

  // Customer users
  const customers = [
    { name: 'Arjun Mehta',       email: 'arjun@techcorp.in',     company: 'TechCorp India',       phone: '+91 99000 10001', password: 'Customer@123' },
    { name: 'Sneha Patel',       email: 'sneha@greenfield.co',   company: 'GreenField Analytics', phone: '+91 99000 10002', password: 'Customer@123' },
    { name: 'Vikram Reddy',      email: 'vikram@cloudnine.io',   company: 'CloudNine Software',   phone: '+91 99000 10003', password: 'Customer@123' },
    { name: 'Ananya Krishnan',   email: 'ananya@finwave.com',    company: 'FinWave Solutions',    phone: '+91 99000 10004', password: 'Customer@123' },
    { name: 'Karthik Subramani', email: 'karthik@logicgate.dev', company: 'LogicGate Dev',        phone: '+91 99000 10005', password: 'Customer@123' },
  ];

  for (const c of customers) {
    await prisma.user.upsert({
      where: { email: c.email },
      create: {
        name: c.name,
        email: c.email,
        passwordHash: hash(c.password),
        role: 'CUSTOMER',
        phone: c.phone,
        company: c.company,
        isActive: true,
      },
      update: {},
    });
    console.log(`  ✅ Customer: ${c.email}`);
  }
}
