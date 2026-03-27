const Project = require('../models/Project');
const Task = require('../models/Task');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Controller: Project Management (Elite v1)
 * Backend Guru Role
 */

// Generate project details from NLP text
exports.generateFromAI = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text prompt required' });

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash-latest' }); 
    const prompt = `You are a project manager expert. Analyze the following project idea in Hebrew: "${text}".
    Return ONLY a valid JSON object with the following fields:
    - name: (Short, catchy name in Hebrew)
    - description: (One sentence description in Hebrew)
    - themeColor: (A Hex color that matches the vibe)
    - meshGradientColors: (Array of 3 Hex colors forming a beautiful gradient)
    - metadata: { suggestedSubtasks: [Array of 5 important initial tasks in Hebrew], category: (string like "Tech", "Home", "Business", etc) }
    
    Ensure the output is strictly JSON.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleaned = responseText.replace(/```json|```/g, '').trim();
    const aiData = JSON.parse(cleaned);

    res.json(aiData);
  } catch (err) {
    console.error('AI Project Generation Error:', err.message);
    res.status(500).json({ error: 'Failed to generate project details', details: err.message });
  }
};

// Create project
exports.createProject = async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      owner: req.user.id
    };
    
    // Create the project
    const newProject = new Project(projectData);
    const savedProject = await newProject.save();

    // If AI suggested tasks, create them automatically
    if (req.body.metadata?.suggestedSubtasks && Array.isArray(req.body.metadata.suggestedSubtasks)) {
      const taskPromises = req.body.metadata.suggestedSubtasks.map(taskTitle => {
        return new Task({
          title: taskTitle,
          projectId: savedProject._id,
          owner: req.user.id,
          status: 'todo'
        }).save();
      });
      await Promise.all(taskPromises);
    }
    
    res.status(201).json(savedProject);
  } catch (err) {
    console.error('Project creation error:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// Get all user projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!project) return res.status(404).json({ error: 'Project not found or unauthorized' });
    
    await Task.deleteMany({ projectId: req.params.id });
    res.json({ message: 'Project and tasks deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
