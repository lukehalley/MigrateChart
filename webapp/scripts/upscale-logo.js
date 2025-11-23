const sharp = require('sharp');
const path = require('path');

const inputFile = path.join(__dirname, '../public/logo/MC_Logo_BG.png');
const outputFile = path.join(__dirname, '../public/logo/MC_Logo_BG.png');

async function upscaleImage() {
  try {
    console.log('Upscaling MC_Logo_BG.png...');

    const metadata = await sharp(inputFile).metadata();
    console.log(`Original size: ${metadata.width}x${metadata.height}`);

    // Upscale 4x to 2000x2000
    await sharp(inputFile)
      .resize(2000, 2000, {
        kernel: sharp.kernel.lanczos3,
        fit: 'fill'
      })
      .png({ compressionLevel: 9, quality: 100 })
      .toFile(outputFile + '.tmp');

    // Replace original with upscaled version
    const fs = require('fs');
    fs.renameSync(outputFile + '.tmp', outputFile);

    const newMetadata = await sharp(outputFile).metadata();
    console.log(`New size: ${newMetadata.width}x${newMetadata.height}`);
    console.log(`File size: ${(newMetadata.size / 1024).toFixed(2)} KB`);
    console.log('\n✅ Image upscaled successfully!');
  } catch (error) {
    console.error('Error upscaling image:', error);
    process.exit(1);
  }
}

upscaleImage();
