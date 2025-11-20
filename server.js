// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// initialize DB (ensures tables)
require('./db');

const apiRoutes = require('./routes/api');
const pageRoutes = require('./routes/pages');
const urlController = require('./controllers/urlController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Basic rate limiter - limit create requests
const shortenLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
});

// Health endpoint
app.get('/healthz', (req, res) => {
  res.json({ ok: true, version: '1.0' });
});

// serve public static assets
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes
// apply limiter only to the shorten endpoint path
app.use('/api/shorten', shortenLimiter);

// pages and api
app.use('/', pageRoutes); // serves "/", "/code/:slug"
app.use('/api', apiRoutes); // API endpoints

// Redirect route (must be AFTER other routes so /code/:slug and /api/* work)
app.get('/:slug', urlController.redirect);

// error handler (simple)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
