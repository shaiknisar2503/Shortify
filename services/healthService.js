// services/healthService.js
const axios = require('axios');

/**
 * Checks the target URL health. Returns 'good' or 'bad'.
 * Uses HEAD first and falls back to GET for servers that don't allow HEAD.
 */
async function checkUrlHealth(url) {
  try {
    // attempt HEAD to be lighter
    const headRes = await axios.head(url, { timeout: 5000, maxRedirects: 5, validateStatus: null });
    const status = headRes.status;
    if (status >= 200 && status < 400) return 'good';
    // if HEAD returns 405 or 501, try GET
    if (status === 405 || status === 501) {
      const getRes = await axios.get(url, { timeout: 5000, maxRedirects: 5, validateStatus: null });
      return (getRes.status >= 200 && getRes.status < 400) ? 'good' : 'bad';
    }
    return 'bad';
  } catch (err) {
    // network/timeouts/errors => bad
    return 'bad';
  }
}

module.exports = { checkUrlHealth };
