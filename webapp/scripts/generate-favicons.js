const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputSvg = path.join(__dirname, '../public/logo/MC_Logo_White.svg');
const appDir = path.join(__dirname, '../app');

async function generateFavicons() {
  try {
    console.log('Generating favicons...');

    // Read SVG
    const svgBuffer = fs.readFileSync(inputSvg);

    // Generate 32x32 PNG for favicon.ico
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(appDir, 'favicon.ico'));
    console.log('✓ Generated favicon.ico (32x32)');

    // Generate 180x180 PNG for Apple icon
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(appDir, 'apple-icon.png'));
    console.log('✓ Generated apple-icon.png (180x180)');

    // Generate 192x192 PNG for icon.png
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(appDir, 'icon.png'));
    console.log('✓ Generated icon.png (192x192)');

    console.log('\n✅ All favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
