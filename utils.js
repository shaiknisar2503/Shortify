// utils.js
const validUrl = require('valid-url');

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = ALPHABET.length;

function encodeBase62(num) {
  if (!num || num === 0) return ALPHABET[0];
  let s = '';
  while (num > 0) {
    s = ALPHABET[num % BASE] + s;
    num = Math.floor(num / BASE);
  }
  return s;
}

function isValidHttpUrl(url) {
  return !!(url && (validUrl.isWebUri(url)));
}

module.exports = { encodeBase62, isValidHttpUrl };
