const crypto = require('crypto');
const User = require('../models/User');

const makeCode = () => `USJ-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

// Generate a unique, uppercase QR code; ensure uniqueness against User.qrCode
const generateUniqueQrCode = async () => {
  let code;
  while (true) {
    code = makeCode();
    const exists = await User.exists({ qrCode: code });
    if (!exists) return code;
  }
};

module.exports = { generateUniqueQrCode };
