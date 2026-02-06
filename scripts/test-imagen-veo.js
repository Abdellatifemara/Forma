// Test Imagen and Veo with different endpoint formats
const API_KEY = 'AIzaSyDN1lZQ62XV6C4gTRkKDEQbemaVJZYBYsI';
const fs = require('fs');
const path = require('path');

async function tryRequest(name, url, body) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Testing: ${name}`);
  console.log(`URL: ${url}`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.log('Raw response:', text.substring(0, 500));
      return null;
    }

    console.log(`Status: ${response.status}`);

    if (data.error) {
      console.log(`Error: ${data.error.message}`);
      return null;
    }

    console.log('SUCCESS!');

    // Save image if present
    if (data.predictions?.[0]?.bytesBase64Encoded) {
      const outputDir = path.join(__dirname, '../generated-images');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
      const filePath = path.join(outputDir, `${name.replace(/\s/g, '-')}.png`);
      fs.writeFileSync(filePath, Buffer.from(data.predictions[0].bytesBase64Encoded, 'base64'));
      console.log(`Image saved: ${filePath}`);
    }

    if (data.generatedImages?.[0]?.image?.imageBytes) {
      const outputDir = path.join(__dirname, '../generated-images');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
      const filePath = path.join(outputDir, `${name.replace(/\s/g, '-')}.png`);
      fs.writeFileSync(filePath, Buffer.from(data.generatedImages[0].image.imageBytes, 'base64'));
      console.log(`Image saved: ${filePath}`);
    }

    console.log('Response keys:', Object.keys(data));
    return data;
  } catch (err) {
    console.log(`Exception: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('IMAGEN & VEO ENDPOINT TESTS');
  console.log('Testing various endpoint formats...\n');

  const prompt = 'A simple blue geometric logo design on white background';

  // Imagen endpoint variations
  const imagenTests = [
    {
      name: 'Imagen 4 - generateContent',
      url: `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:generateContent?key=${API_KEY}`,
      body: { contents: [{ parts: [{ text: prompt }] }] }
    },
    {
      name: 'Imagen 4 - generateImages',
      url: `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:generateImages?key=${API_KEY}`,
      body: { prompt: prompt, config: { numberOfImages: 1 } }
    },
    {
      name: 'Imagen 4 Fast - predict',
      url: `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${API_KEY}`,
      body: { instances: [{ prompt: prompt }], parameters: { sampleCount: 1 } }
    },
    {
      name: 'Nano Banana (Gemini 2.5 Flash Image)',
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${API_KEY}`,
      body: { contents: [{ parts: [{ text: `Generate an image: ${prompt}` }] }] }
    },
    {
      name: 'Nano Banana Pro',
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${API_KEY}`,
      body: { contents: [{ parts: [{ text: `Generate an image: ${prompt}` }] }] }
    },
  ];

  for (const test of imagenTests) {
    await tryRequest(test.name, test.url, test.body);
  }

  // Veo endpoint variations
  const veoTests = [
    {
      name: 'Veo 2 - generateContent',
      url: `https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001:generateContent?key=${API_KEY}`,
      body: { contents: [{ parts: [{ text: 'A person exercising in a gym' }] }] }
    },
    {
      name: 'Veo 3 - generateContent',
      url: `https://generativelanguage.googleapis.com/v1beta/models/veo-3.0-generate-001:generateContent?key=${API_KEY}`,
      body: { contents: [{ parts: [{ text: 'A person exercising in a gym' }] }] }
    },
    {
      name: 'Veo 3 - generateVideo',
      url: `https://generativelanguage.googleapis.com/v1beta/models/veo-3.0-generate-001:generateVideo?key=${API_KEY}`,
      body: { prompt: 'A person exercising in a gym', config: { durationSeconds: 5 } }
    },
  ];

  for (const test of veoTests) {
    await tryRequest(test.name, test.url, test.body);
  }

  // Try using Gemini 2.5 Flash with image generation instruction
  console.log('\n\nTrying Gemini models with image generation request...');

  const geminiImageTest = await tryRequest(
    'Gemini 2.5 Flash - Image Request',
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
    {
      contents: [{
        parts: [{
          text: 'Please generate an image of a modern fitness app logo with the letter F in coral orange color.'
        }]
      }],
      generationConfig: {
        responseModalities: ['image', 'text']
      }
    }
  );

  console.log('\n' + '='.repeat(50));
  console.log('TESTS COMPLETE');
}

main();
