const express = require('express');
const participations = require('./participations');
const projects = require('./projects');
const summary = require('./summary');

const router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  }),
);
router.use(express.json({}));
router.use('/participations', participations);
router.use('/projects', projects);
router.use('/summary', summary);

module.exports = router;
