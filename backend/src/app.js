// ─── Express App ─────────────────────────────────────────────────────────────
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import env from './config/env.js';
import routes from './routes/index.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// ── Security ──
app.use(helmet());
app.use(cors({
  origin: [env.frontendUrl, 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

// ── Body parsing ──
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ── Logging ──
if (env.isDev) {
  app.use(morgan('dev'));
}

// ── Routes ──
app.use('/api', routes);

// ── Error handling ──
app.use(notFound);
app.use(errorHandler);

export default app;
