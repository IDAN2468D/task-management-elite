const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const modelsToTry = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-1.0-pro'
];

async function bruteForce() {
  const key = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(key);

  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("test");
      console.log(`✅ Success with ${modelName}!`);
      return;
    } catch (err) {
      console.log(`❌ Failed ${modelName}: ${err.message}`);
    }
  }
}

bruteForce();
