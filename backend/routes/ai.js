const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { google } = require('googleapis');
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');

// Backend System Certification - AI Logic Hardening
const REQUIRED_ENV = ['GEMINI_API_KEY'];
REQUIRED_ENV.forEach(key => {
  if (!process.env[key]) {
    console.warn(`[AI-BACKEND] WARNING: Missing environment variable ${key}. Some AI features may not function correctly.`);
  }
});

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/ai/breakdown
router.post('/breakdown', async (req, res) => {
  const { taskTitle } = req.body;
  if (!taskTitle) return res.status(400).json({ error: 'חסר שם משימה' });

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });
    const prompt = `Break down the following task into 3-5 actionable subtasks in Hebrew. 
    Return ONLY a valid JSON array of strings representing the subtasks. Example: ["משימה 1", "משימה 2"]
    Task: "${taskTitle}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let subtasks = [];
    try {
      const jsonMatch = responseText.match(/\[.*\]/s) || responseText.match(/\{.*\}/s);
      const cleaned = jsonMatch ? jsonMatch[0] : responseText.replace(/```json|```/g, '').trim();
      subtasks = JSON.parse(cleaned);
      if (!Array.isArray(subtasks)) {
        subtasks = Object.values(subtasks);
      }
    } catch (e) {
      subtasks = ["ארגון התחלתי", "ביצוע שלבי ביניים", "בדיקה או סיום"];
    }

    res.json({ subtasks });
  } catch (err) {
    console.error('Gemini breakdown error:', err.message);
    res.status(500).json({
      error: 'AI Error: פנה למנהל הרשת',
      details: err.message
    });
  }
});

// POST /api/ai/parse-quick-add
router.post('/parse-quick-add', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'חסר טקסט לניתוח' });

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });
    const prompt = `Analyze the following Hebrew text for a task. Extract the task title, and if mentioned, the relative due date. 
    Return ONLY a valid JSON object with 'title' (string) and 'dueDate' (ISO string or null). 
    Text: "${text}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{.*\}/s);
    const cleaned = jsonMatch ? jsonMatch[0] : responseText.replace(/```json|```/g, '').trim();

    res.json(JSON.parse(cleaned));
  } catch (err) {
    console.error('Quick-add error:', err.message);
    res.status(500).json({
      error: 'שגיאה בניתוח הטקסט',
      details: err.message
    });
  }
});

// POST /api/ai/schedule
router.post('/schedule', async (req, res) => {
  const { tasks } = req.body;
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });
    const prompt = `Given these tasks: ${JSON.stringify(tasks)}, suggest a prioritized order based on energy levels and deadlines. Return ONLY a JSON array of the task IDs in the suggested order.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\[.*\]/s);
    const cleaned = jsonMatch ? jsonMatch[0] : responseText.replace(/```json|```/g, '').trim();

    res.json({ order: JSON.parse(cleaned) });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בתזמון' });
  }
});

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  const { message, context } = req.body;
  if (!message) return res.status(400).json({ error: 'חסר הודעה' });

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });
    const contextStr = context ? `\n\nכאן המידע הנוכחי על המשתמש:\n${JSON.stringify(context)}` : '';
    const prompt = `You are an AI assistant in the 'TaskMaster AI' productivity app. The app helps users manage tasks, calendars, and focus sessions.
Respond to the following user message natively in Hebrew. Keep your answer helpful, encouraging, short, and to the point.
${contextStr}

User: ${message}`;

    const result = await model.generateContent(prompt);
    res.json({ reply: result.response.text() });
  } catch (err) {
    console.error('Gemini chat error:', err.message);
    res.status(500).json({
      error: 'AI Error: שרת הבינה נתקל בתקלה',
      details: err.message
    });
  }
});

// POST /api/ai/analyze (Project Status Analysis)
router.post('/analyze', async (req, res) => {
  const { tasks } = req.body;
  if (!tasks || !Array.isArray(tasks)) return res.status(400).json({ error: 'חסר נתוני משימות לניתוח' });

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });
    const prompt = `Analyze the following tasks for this project: ${JSON.stringify(tasks.slice(0, 50))}. 
    Provide a professional, concise executive summary (2-3 sentences max) in Hebrew. 
    Focus on overall progress, identify one bottleneck or risk, and give one concrete advice to finish faster.`;

    const result = await model.generateContent(prompt);
    res.json({ analysis: result.response.text().trim() });
  } catch (err) {
    console.error('Project Analysis error:', err.message);
    res.status(500).json({ error: 'ניתוח פרויקט נכשל', details: err.message });
  }
});

// POST /api/ai/save-to-drive
router.post('/save-to-drive', auth, async (req, res) => {
  const { content, accessToken, fileName } = req.body;
  if (!content) return res.status(400).json({ error: 'אין תוכן לשמירה' });
  if (!accessToken) return res.status(400).json({ error: 'חסר Google Access Token' });

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const fileMetadata = {
      name: fileName || `TaskMaster-AI-Insight-${new Date().toISOString().split('T')[0]}.txt`,
      mimeType: 'text/plain',
    };

    const media = {
      mimeType: 'text/plain',
      body: content,
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    res.json({
      success: true,
      message: 'הקובץ נוצר בהצלחה ב-Google Drive',
      fileId: file.data.id
    });
  } catch (err) {
    console.error('Google Drive save error:', err.message);
    res.status(500).json({
      error: 'שגיאה בשמירה ל-Google Drive',
      details: err.response?.data || err.message
    });
  }
});

// --- AI Document Summarization ---
router.post('/summarize-file', auth, async (req, res) => {
  const { fileId, accessToken } = req.body;
  if (!fileId || !accessToken) return res.status(400).json({ error: 'Missing fileId or accessToken' });

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const fileMetadata = await drive.files.get({ fileId, fields: 'name, mimeType' });
    let content = '';

    if (fileMetadata.data.mimeType === 'application/vnd.google-apps.document') {
      const docRes = await drive.files.export({ fileId, mimeType: 'text/plain' });
      content = docRes.data;
    } else {
      const fileRes = await drive.files.get({ fileId, alt: 'media' });
      content = typeof fileRes.data === 'string' ? fileRes.data : 'Binary content';
    }

    const model = ai.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
    const prompt = `Summarize the following document titled "${fileMetadata.data.name}". 
    Focus on key milestones, action items, and potential risks. 
    Format in professional Hebrew (RTL).
    Content: ${content.substring(0, 15000)}`;

    const result = await model.generateContent(prompt);
    res.json({ fileName: fileMetadata.data.name, summary: result.response.text() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to summarize document' });
  }
});

// --- Semantic Task Search ---
router.post('/search-tasks', auth, async (req, res) => {
  const { query, projectId } = req.body;
  if (!query) return res.status(400).json({ error: 'Query required' });

  try {
    const filter = projectId ? { projectId } : {};
    const tasks = await Task.find(filter).populate('projectId', 'name');

    const model = ai.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
    const prompt = `Based on the following tasks, find relevant ones to: "${query}".
    Provide a brief Hebrew explanation and next step.
    Tasks: ${JSON.stringify(tasks.map(t => ({ title: t.title, project: t.projectId?.name, status: t.status })))}`;

    const result = await model.generateContent(prompt);
    res.json({ results: result.response.text() });
  } catch (err) {
    res.status(500).json({ error: 'Semantic search failed' });
  }
});

// --- AI Burnout Analytics ---
router.get('/burnout-risk', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({ userId });
    
    const stats = {
      total: tasks.length,
      incomplete: tasks.filter(t => t.status !== 'done').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
      projectDistribution: {}
    };

    tasks.forEach(t => {
      const pId = t.projectId ? t.projectId.toString() : 'Inbox';
      stats.projectDistribution[pId] = (stats.projectDistribution[pId] || 0) + 1;
    });

    const model = ai.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
    const prompt = `Productivity data analysis for a user. 
    Provide a "Burnout Risk Assessment" in Hebrew.
    Return ONLY valid JSON: {riskScore(0-100), level(low|medium|high|critical), insights(string[]), recommendation(string)}
    Data: ${JSON.stringify(stats)}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{.*\}/s) || [responseText];
    
    res.json(JSON.parse(jsonMatch[0].trim()));
  } catch (err) {
    res.status(500).json({ error: 'Burnout risk calculation failed' });
  }
});

module.exports = router;