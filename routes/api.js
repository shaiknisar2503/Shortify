// routes/api.js
const router = require('express').Router();
const ctrl = require('../controllers/urlController');

// Create short url
router.post('/shorten', ctrl.shorten);

// List URLs
router.get('/urls', ctrl.getAll);

// Delete one
router.delete('/url/:id', ctrl.deleteUrl);

// Stats
router.get('/info/:slug', ctrl.info);

module.exports = router;
