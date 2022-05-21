const express = require('express');
const asyncHandler = require('express-async-handler');
const Project = require('../../models/Project');

const router = express.Router();

router.get(
  '/:projectId',
  asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    res.json(project);
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const project = new Project({
      name: req.body.name,
    });
    await project.save();
    res.json(project);
  }),
);

module.exports = router;
