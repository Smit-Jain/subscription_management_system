// ─── Config: Environment Variables ───────────────────────────────────────────
// Loads .env, validates required vars, and exports typed config.
// Fails fast at startup if a required var is missing.
// ─────────────────────────────────────────────────────────────────────────────
import 'dotenv/config';

const required = (key) => {
  const val = process.env[key];
  if (!val) {
    console.error(`❌  Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return val;
};

const optional = (key, fallback) => process.env[key] || fallback;

const jwtSecret = required('JWT_SECRET');
if (jwtSecret.length < 16) {
  console.error('❌  JWT_SECRET must be at least 16 characters long');
  process.exit(1);
}

const env = {
  port:             parseInt(optional('PORT', '5000'), 10),
  nodeEnv:          optional('NODE_ENV', 'development'),
  isDev:            optional('NODE_ENV', 'development') === 'development',
  databaseUrl:      required('DATABASE_URL'),
  jwtSecret,
  jwtExpiresIn:     optional('JWT_EXPIRES_IN', '7d'),
  frontendUrl:      optional('FRONTEND_URL', 'http://localhost:5173'),
  resetTokenTtlMin: parseInt(optional('RESET_TOKEN_TTL_MINUTES', '30'), 10),
  inviteTokenTtlHr: parseInt(optional('INVITE_TOKEN_TTL_HOURS', '24'), 10),
  bcryptRounds:     parseInt(optional('BCRYPT_ROUNDS', '10'), 10),
  smtp: {
    host:  optional('SMTP_HOST', ''),
    port:  parseInt(optional('SMTP_PORT', '587'), 10),
    user:  optional('SMTP_USER', ''),
    pass:  optional('SMTP_PASS', ''),
  },
  mailFrom:         optional('MAIL_FROM', 'Brightloop <no-reply@brightloop.io>'),
  seedAdminEmail:   optional('SEED_ADMIN_EMAIL', 'admin@brightloop.com'),
  seedAdminPassword: optional('SEED_ADMIN_PASSWORD', 'Admin@12345'),
};

export default env;
