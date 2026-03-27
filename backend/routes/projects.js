const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects');
const auth = require('../middleware/auth');

// Protect all project routes
router.use(auth);

// GET /api/projects - Get all projects for current user
router.get('/', projectsController.getProjects);

// POST /api/projects - Create a new project (manual)
router.post('/', projectsController.createProject);

// POST /api/projects/ai-generate - Get project details from AI
router.post('/ai-generate', projectsController.generateFromAI);

// DELETE /api/projects/:id - Delete project and its tasks
router.delete('/:id', projectsController.deleteProject);

module.exports = router;
