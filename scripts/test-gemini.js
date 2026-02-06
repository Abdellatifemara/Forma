// Test Gemini API Connection
const API_KEY = 'AIzaSyDN1lZQ62XV6C4gTRkKDEQbemaVJZYBYsI';

async function testGemini() {
  console.log('Testing Gemini API connection...\n');

  // Test 1: List available models
  console.log('1. Fetching available models...');
  try {
    const modelsResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    const modelsData = await modelsResponse.json();

    if (modelsData.error) {
      console.log('Error:', modelsData.error.message);
      return;
    }

    console.log('Available models:');
    modelsData.models?.forEach(model => {
      console.log(`  - ${model.name} (${model.displayName})`);
    });
    console.log('');
  } catch (err) {
    console.log('Error fetching models:', err.message);
    return;
  }

  // Test 2: Simple text generation
  console.log('2. Testing text generation (Gemini Flash)...');
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Say "Forma API test successful!" in one line.' }]
          }]
        })
      }
    );
    const data = await response.json();

    if (data.error) {
      console.log('Error:', data.error.message);
    } else {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('Response:', text);
    }
    console.log('');
  } catch (err) {
    console.log('Error:', err.message);
  }

  // Test 3: Check if Imagen is available
  console.log('3. Checking Imagen (image generation) availability...');
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'A simple blue circle on white background',
          number_of_images: 1
        })
      }
    );
    const data = await response.json();

    if (data.error) {
      console.log('Imagen status:', data.error.message);
    } else {
      console.log('Imagen: Available!');
    }
    console.log('');
  } catch (err) {
    console.log('Error:', err.message);
  }

  console.log('API test complete!');
}

testGemini();
