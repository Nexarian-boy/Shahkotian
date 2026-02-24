/**
 * Image upload utility using freeimage.host API
 * All images (profiles, posts, listings, rishta, news, police, DMs, tournaments)
 * are hosted here for free. Videos stay on Cloudinary.
 */

const https = require('https');
const querystring = require('querystring');

const FREEIMAGE_API_KEY = process.env.FREEIMAGE_API_KEY || '6d207e02198a847aa98d0a2a901485a5';
const FREEIMAGE_URL = 'freeimage.host';
const FREEIMAGE_PATH = '/api/1/upload';

/**
 * Upload a single image buffer to freeimage.host
 * @param {Buffer} buffer - Image buffer from multer memory storage
 * @returns {Promise<string>} - Public URL of uploaded image
 */
async function uploadImage(buffer) {
  return new Promise((resolve, reject) => {
    const base64 = Buffer.isBuffer(buffer) ? buffer.toString('base64') : buffer.buffer.toString('base64');

    const postData = querystring.stringify({
      key: FREEIMAGE_API_KEY,
      action: 'upload',
      source: base64,
      format: 'json',
    });

    const options = {
      hostname: FREEIMAGE_URL,
      path: FREEIMAGE_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status_code === 200 && json.image?.url) {
            resolve(json.image.url);
          } else {
            reject(new Error(`freeimage.host error: ${json.status_txt || 'Unknown error'}`));
          }
        } catch (e) {
          reject(new Error('Failed to parse freeimage.host response'));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Upload a multer file object (has .buffer) or a raw Buffer
 * Handles both single file and raw Buffer
 */
async function uploadImageFile(file) {
  const buffer = Buffer.isBuffer(file) ? file : file.buffer;
  return uploadImage(buffer);
}

/**
 * Upload multiple image files in parallel
 * @param {Array} files - Array of multer file objects
 * @returns {Promise<string[]>} - Array of public URLs
 */
async function uploadMultipleImages(files, _folder) {
  // _folder param is ignored (kept for drop-in replacement compatibility)
  return Promise.all(files.map(file => uploadImageFile(file)));
}

module.exports = { uploadImageFile, uploadMultipleImages };
