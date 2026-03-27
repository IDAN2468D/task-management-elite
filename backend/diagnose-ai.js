const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function checkKey() {
  console.log('--- GEMINI DIAGNOSTICS ---');
  const key = process.env.GEMINI_API_KEY;
  console.log('Key exists:', !!key);
  
  if (!key) return;

  const genAI = new GoogleGenerativeAI(key);
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent("Say hello");
    console.log('✅ Success with gemini-pro:', result.response.text());
  } catch (err) {
    console.log('❌ Failed with gemini-pro:', err.message);
    if (err.status) console.log('Status:', err.status);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent("Say hello");
    console.log('✅ Success with gemini-1.5-flash:', result.response.text());
  } catch (err) {
    console.log('❌ Failed with gemini-1.5-flash:', err.message);
  }
}

checkKey();
