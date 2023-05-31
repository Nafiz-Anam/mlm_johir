// const crypto = require('crypto')
// const ENCRYPTION_KEY = process.env.ENV_KEY
// const JSEncrypt = require('node-jsencrypt')
// const IV_LENGTH = 16

exports.encrypt = (code) => {
  // let iv = crypto.randomBytes(IV_LENGTH)
  // let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  // let encrypted = cipher.update(code)
  // encrypted = Buffer.concat([encrypted, cipher.final()])
  // return iv.toString('hex') + ':' + encrypted.toString('hex')

  let buff = Buffer.from(code);
  let encryptData = buff.toString("base64");
  return encryptData;
};

exports.decrypt = (code) => {
  // let textParts = code.split(':');
  // let iv = Buffer.from(textParts.shift(), 'hex');
  // let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  // let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  // let decrypted = decipher.update(encryptedText);
  // decrypted = Buffer.concat([decrypted, decipher.final()]);
  // return decrypted.toString();

  let buff = Buffer.from(code, "base64");
  let decryptedData = buff.toString("ascii");
  return decryptedData;
};
