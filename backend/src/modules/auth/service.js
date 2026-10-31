// ─── Auth Service ────────────────────────────────────────────────────────────
// Business logic for authentication, users, staff, and customers.
// ─────────────────────────────────────────────────────────────────────────────
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma.js';
import env from '../../config/env.js';
import AppError from '../../utils/AppError.js';
import { signJwt, generateToken, hashToken } from '../../utils/tokens.js';
import { sendEmail, emailTemplate } from '../../utils/email.js';

// ── User select without passwordHash ──
const safeUserSelect = {
  id: true, name: true, email: true, role: true,
  phone: true, company: true, isActive: true,
  createdAt: true, updatedAt: true,
};

// ── Helpers ──
async function hashPassword(plain) {
  return bcrypt.hash(plain, env.bcryptRounds);
}

function toUserResponse(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════

export async function signup({ name, email, password, phone, company }) {
  // Check uniqueness
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    throw new AppError('Email already registered', 409, { email: 'This email is already registered' });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, phone, company, role: 'CUSTOMER' },
    select: safeUserSelect,
  });

  const token = signJwt(user);
  return { token, user };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Contact support.', 403);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signJwt(user);
  return { token, user: toUserResponse(user) };
}

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: safeUserSelect,
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
}

export async function updateMe(userId, data) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: safeUserSelect,
  });
  return user;
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    throw new AppError('Current password is incorrect', 400, { currentPassword: 'Current password is incorrect' });
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

export async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always return the same response to prevent enumeration
  if (!user) return;

  // Invalidate older unused tokens
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + env.resetTokenTtlMin * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const resetLink = `${env.frontendUrl}/reset-password?token=${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Reset your Brightloop password',
    html: emailTemplate('Reset Your Password', `
      <p style="color:#6B667A;line-height:1.6;">
        Hi ${user.name},<br/><br/>
        We received a request to reset your password. Click the button below to set a new one.
        This link expires in ${env.resetTokenTtlMin} minutes.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${resetLink}"
           style="display:inline-block;padding:12px 32px;background:#0E5A55;color:#FFFDF8;
                  text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;">
          Reset Password
        </a>
      </div>
      <p style="color:#6B667A;font-size:13px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    `),
  });
}

export async function resetPassword(rawToken, newPassword) {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt) {
    throw new AppError('Invalid or already-used reset token', 400);
  }
  if (record.expiresAt < new Date()) {
    throw new AppError('This reset link has expired. Please request a new one.', 400);
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);
}

// ══════════════════════════════════════════════════════════════════════════════
// STAFF MANAGEMENT (ADMIN only)
// ══════════════════════════════════════════════════════════════════════════════

export async function listStaff({ page, limit, skip, search }) {
  const where = { role: { in: ['ADMIN', 'STAFF'] } };
  if (search) {
    where.OR = [
      { name:  { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: safeUserSelect,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page, limit };
}

export async function createStaff({ name, email, password, phone }, createdById) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    throw new AppError('Email already registered', 409, { email: 'This email is already registered' });
  }

  let passwordHash;
  let rawResetToken = null;

  if (password) {
    passwordHash = await hashPassword(password);
  } else {
    // Generate random password + invite link
    const randomPw = generateToken(16);
    passwordHash = await hashPassword(randomPw);
    rawResetToken = generateToken();
  }

  const user = await prisma.user.create({
    data: { name, email, passwordHash, phone, role: 'STAFF', createdById },
    select: safeUserSelect,
  });

  let devResetLink = undefined;

  if (rawResetToken) {
    const tokenHash = hashToken(rawResetToken);
    const expiresAt = new Date(Date.now() + env.inviteTokenTtlHr * 60 * 60 * 1000);
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const inviteLink = `${env.frontendUrl}/reset-password?token=${rawResetToken}`;

    await sendEmail({
      to: email,
      subject: 'Welcome to Brightloop — Set your password',
      html: emailTemplate('Welcome to Brightloop!', `
        <p style="color:#6B667A;line-height:1.6;">
          Hi ${name},<br/><br/>
          You've been added as a staff member at Brightloop Software.
          Click the button below to set your password. This link expires in ${env.inviteTokenTtlHr} hours.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${inviteLink}"
             style="display:inline-block;padding:12px 32px;background:#0E5A55;color:#FFFDF8;
                    text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;">
            Set Password
          </a>
        </div>
      `),
    });

    if (!env.smtp.host) {
      devResetLink = inviteLink;
    }
  }

  return { user, devResetLink };
}

export async function getStaffById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: safeUserSelect,
  });
  if (!user || !['ADMIN', 'STAFF'].includes(user.role)) {
    throw new AppError('Staff member not found', 404);
  }
  return user;
}

export async function updateStaff(id, data, adminUserId) {
  // Prevent admin from deactivating themselves
  if (data.isActive === false && id === adminUserId) {
    throw new AppError('You cannot deactivate your own account', 400);
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || !['ADMIN', 'STAFF'].includes(existing.role)) {
    throw new AppError('Staff member not found', 404);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: safeUserSelect,
  });
  return user;
}

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOMER MANAGEMENT (ADMIN + STAFF)
// ══════════════════════════════════════════════════════════════════════════════

export async function listCustomers({ page, limit, skip, search, isActive }) {
  const where = { role: 'CUSTOMER' };
  if (typeof isActive === 'boolean') where.isActive = isActive;
  if (search) {
    where.OR = [
      { name:    { contains: search, mode: 'insensitive' } },
      { email:   { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: safeUserSelect,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page, limit };
}

export async function getCustomerById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: safeUserSelect,
  });
  if (!user || user.role !== 'CUSTOMER') {
    throw new AppError('Customer not found', 404);
  }
  return user;
}

export async function createCustomer({ name, email, password, phone, company }, createdById) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    throw new AppError('Email already registered', 409, { email: 'This email is already registered' });
  }

  let passwordHash;
  let rawResetToken = null;

  if (password) {
    passwordHash = await hashPassword(password);
  } else {
    const randomPw = generateToken(16);
    passwordHash = await hashPassword(randomPw);
    rawResetToken = generateToken();
  }

  const user = await prisma.user.create({
    data: { name, email, passwordHash, phone, company, role: 'CUSTOMER', createdById },
    select: safeUserSelect,
  });

  let devResetLink = undefined;

  if (rawResetToken) {
    const tokenHash = hashToken(rawResetToken);
    const expiresAt = new Date(Date.now() + env.inviteTokenTtlHr * 60 * 60 * 1000);
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const inviteLink = `${env.frontendUrl}/reset-password?token=${rawResetToken}`;

    await sendEmail({
      to: email,
      subject: 'Welcome to Brightloop — Set your password',
      html: emailTemplate('Welcome to Brightloop!', `
        <p style="color:#6B667A;line-height:1.6;">
          Hi ${name},<br/><br/>
          An account has been created for you at Brightloop Software.
          Click below to set your password.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${inviteLink}"
             style="display:inline-block;padding:12px 32px;background:#0E5A55;color:#FFFDF8;
                    text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;">
            Set Password
          </a>
        </div>
      `),
    });

    if (!env.smtp.host) {
      devResetLink = inviteLink;
    }
  }

  return { user, devResetLink };
}

export async function updateCustomer(id, data, requestingUser) {
  // Only ADMIN can change isActive
  if (data.isActive !== undefined && requestingUser.role !== 'ADMIN') {
    throw new AppError('Only admins can activate/deactivate customers', 403);
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || existing.role !== 'CUSTOMER') {
    throw new AppError('Customer not found', 404);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: safeUserSelect,
  });
  return user;
}
