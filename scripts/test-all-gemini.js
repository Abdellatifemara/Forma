// Comprehensive Gemini API Test - Try all endpoints
const API_KEY = 'AIzaSyDN1lZQ62XV6C4gTRkKDEQbemaVJZYBYsI';
const fs = require('fs');
const path = require('path');

// Test different API versions and endpoints
async function tryEndpoint(name, url, body) {
  console.log(`\nTrying: ${name}`);
  console.log(`URL: ${url}`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    if (data.error) {
      console.log(`Error: ${data.error.message}`);
    } else {
      console.log('SUCCESS! Response:', JSON.stringify(data, null, 2).substring(0, 500));
      return data;
    }
  } catch (err) {
    console.log(`Exception: ${err.message}`);
  }
  return null;
}

async function main() {
  console.log('='.repeat(60));
  console.log('COMPREHENSIVE GEMINI API TEST');
  console.log('='.repeat(60));

  // 1. Try Gemini 2.5 Flash (might have different quota)
  await tryEndpoint(
    'Gemini 2.5 Flash',
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
    {
      contents: [{ parts: [{ text: 'Say hello' }] }]
    }
  );

  // 2. Try Gemini Flash Lite (usually has higher free quota)
  await tryEndpoint(
    'Gemini 2.0 Flash Lite',
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${API_KEY}`,
    {
      contents: [{ parts: [{ text: 'Say hello' }] }]
    }
  );

  // 3. Try Gemini 2.5 Flash Lite
  await tryEndpoint(
    'Gemini 2.5 Flash Lite',
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`,
    {
      contents: [{ parts: [{ text: 'Say hello' }] }]
    }
  );

  // 4. Try Gemini 3 Flash Preview
  await tryEndpoint(
    'Gemini 3 Flash Preview',
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`,
    {
      contents: [{ parts: [{ text: 'Say hello' }] }]
    }
  );

  // 5. Try v1 API instead of v1beta
  await tryEndpoint(
    'Gemini Flash (v1 API)',
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
    {
      contents: [{ parts: [{ text: 'Say hello' }] }]
    }
  );

  // 6. Try Imagen with v1 API
  await tryEndpoint(
    'Imagen 4 (v1 API)',
    `https://generativelanguage.googleapis.com/v1/models/imagen-4.0-generate-001:predict?key=${API_KEY}`,
    {
      instances: [{ prompt: 'A blue circle' }],
      parameters: { sampleCount: 1 }
    }
  );

  // 7. Try Imagen Fast (might have different billing)
  await tryEndpoint(
    'Imagen 4 Fast',
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${API_KEY}`,
    {
      instances: [{ prompt: 'A blue circle' }],
      parameters: { sampleCount: 1 }
    }
  );

  // 8. Try Veo 2
  await tryEndpoint(
    'Veo 2 Video Generation',
    `https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001:predict?key=${API_KEY}`,
    {
      instances: [{ prompt: 'A person doing a squat exercise' }],
      parameters: { durationSeconds: 5 }
    }
  );

  // 9. Check account/billing info endpoint
  console.log('\n\nChecking for billing/quota info...');
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    const data = await response.json();
    console.log(`Total models available: ${data.models?.length || 0}`);

    // Check for paid-only models
    const paidModels = data.models?.filter(m =>
      m.name.includes('imagen') || m.name.includes('veo')
    );
    console.log(`Paid models visible: ${paidModels?.length || 0}`);
    paidModels?.forEach(m => console.log(`  - ${m.displayName}`));
  } catch (err) {
    console.log('Error:', err.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('TEST COMPLETE');
  console.log('='.repeat(60));
}

main();
