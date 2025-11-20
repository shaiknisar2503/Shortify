// routes/pages.js
const router = require('express').Router();
const path = require('path');

// Dashboard
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Stats page for slug
router.get('/code/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/code.html'));
});

module.exports = router;
