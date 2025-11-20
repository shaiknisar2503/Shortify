// controllers/urlController.js
const db = require('../db');
const { encodeBase62, isValidHttpUrl } = require('../utils');
const { checkUrlHealth } = require('../services/healthService');

/**
 * POST /api/shorten
 * body: { url: string }
 * returns { slug, shortUrl, health }
 */
exports.shorten = async (req, res) => {
  const url = req.body.url;
  if (!url || !isValidHttpUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL. Provide full http/https URL.' });
  }

  // Check health
  const health = await checkUrlHealth(url);

  // Insert target_url & health_status
  const insert = db.prepare('INSERT INTO ShortUrls (target_url, health_status) VALUES (?, ?)');
  const info = insert.run(url, health);
  const id = info.lastInsertRowid;
  const slug = encodeBase62(id);

  db.prepare('UPDATE ShortUrls SET slug = ? WHERE id = ?').run(slug, id);

  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  const shortUrl = `${baseUrl}/${slug}`;

  res.json({ slug, shortUrl, health_status: health });
};

/**
 * GET /api/urls
 * returns all short URLs
 */
exports.getAll = (req, res) => {
  const rows = db.prepare('SELECT id, slug, target_url, created_at, click_count, health_status FROM ShortUrls ORDER BY id DESC').all();
  res.json(rows);
};

/**
 * DELETE /api/url/:id
 */
exports.deleteUrl = (req, res) => {
  const id = req.params.id;
  const info = db.prepare('DELETE FROM ShortUrls WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
};

/**
 * GET /api/info/:slug
 */
exports.info = (req, res) => {
  const slug = req.params.slug;
  const row = db.prepare('SELECT id, slug, target_url, created_at, click_count, health_status FROM ShortUrls WHERE slug = ?').get(slug);
  if (!row) return res.status(404).json({ error: 'Not found' });

  const clicks = db.prepare('SELECT timestamp, ip, user_agent, referrer FROM Clicks WHERE shorturl_id = ? ORDER BY id DESC LIMIT 100').all(row.id);
  res.json({ ...row, clicks });
};

/**
 * GET /:slug
 * redirect handler
 */
exports.redirect = (req, res) => {
  const slug = req.params.slug;
  const row = db.prepare('SELECT id, target_url FROM ShortUrls WHERE slug = ?').get(slug);
  if (!row) return res.status(404).send('Short URL not found');

  // Log click (best-effort)
  try {
    db.prepare('INSERT INTO Clicks (shorturl_id, ip, user_agent, referrer) VALUES (?, ?, ?, ?)').run(
      row.id,
      req.ip,
      req.get('User-Agent') || '',
      req.get('Referrer') || req.get('Referer') || ''
    );
    db.prepare('UPDATE ShortUrls SET click_count = click_count + 1 WHERE id = ?').run(row.id);
  } catch (err) {
    console.error('Click log failed', err);
  }

  // Redirect 302
  return res.redirect(302, row.target_url);
};
