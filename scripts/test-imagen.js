// Test Imagen Image Generation
const API_KEY = 'AIzaSyDN1lZQ62XV6C4gTRkKDEQbemaVJZYBYsI';
const fs = require('fs');
const path = require('path');

async function generateImage() {
  console.log('Testing Imagen 4 image generation...\n');

  const prompt = 'Modern fitness app logo, minimalist design, letter F made of dynamic flowing lines, coral orange and white colors, clean vector style, app icon format';

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '1:1'
          }
        })
      }
    );

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
      const imageBuffer = Buffer.from(data.predictions[0].bytesBase64Encoded, 'base64');
      const outputPath = path.join(__dirname, '../generated-images');

      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      const filePath = path.join(outputPath, 'test-logo.png');
      fs.writeFileSync(filePath, imageBuffer);
      console.log('Image saved to:', filePath);
    }
  } catch (err) {
    console.log('Error:', err.message);
  }
}

// Also try the generate endpoint format
async function generateImageAlt() {
  console.log('\nTrying alternative endpoint...\n');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:generateImages?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Modern fitness app icon, minimalist F letter, coral orange gradient, white background',
          config: {
            numberOfImages: 1
          }
        })
      }
    );

    const data = await response.json();
    console.log('Alt Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.log('Alt Error:', err.message);
  }
}

async function main() {
  await generateImage();
  await generateImageAlt();
}

main();
