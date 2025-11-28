const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToAvif(inputPath, outputPath, width = 1024) {
  try {
    console.log(`Converting ${path.basename(inputPath)} to AVIF...`);

    await sharp(inputPath)
      .resize(width, width, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .avif({
        quality: 90,
        lossless: false,
        effort: 9
      })
      .toFile(outputPath);

    const inputSize = fs.statSync(inputPath).size;
    const outputSize = fs.statSync(outputPath).size;

    console.log(`✓ ${path.basename(outputPath)}`);
    console.log(`  Input:  ${(inputSize / 1024).toFixed(1)}KB (SVG)`);
    console.log(`  Output: ${(outputSize / 1024).toFixed(1)}KB (AVIF)`);
    console.log(`  Size:   ${width}x${width}px @ 90 quality\n`);
  } catch (error) {
    console.error(`✗ Failed to convert ${inputPath}:`, error.message);
  }
}

async function main() {
  const publicDir = path.join(__dirname, '..', 'public');

  await convertSvgToAvif(
    path.join(publicDir, 'zera-optimized.svg'),
    path.join(publicDir, 'zera-optimized.avif'),
    1024
  );

  await convertSvgToAvif(
    path.join(publicDir, 'payai-optimized.svg'),
    path.join(publicDir, 'payai-optimized.avif'),
    1024
  );

  console.log('All conversions complete!');
}

main();
