const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'public', 'Profile.png');
const outputPath = path.join(__dirname, '..', 'public', 'Profile.webp');

sharp(inputPath)
  .resize(1200, 1200, {
    fit: 'contain',
    withoutEnlargement: true
  })
  .webp({
    quality: 82,
    effort: 6,
    lossless: false
  })
  .toFile(outputPath)
  .then((info) => {
    console.log('Compressed to WebP:', info);
    console.log('Size:', (info.size / 1024).toFixed(1) + 'KB');
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
