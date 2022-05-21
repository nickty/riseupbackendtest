const express = require('express');
const asyncHandler = require('express-async-handler');
const Participation = require('../../models/Participation');

const router = express.Router();

router.get(
  '/:participationId',
  asyncHandler(async (req, res) => {
    const participation = await Participation.findById(
      req.params.participationId,
    );
    if (!participation) {
      throw new Error('Participation not found');
    }
    res.json(participation);
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const participation = new Participation({
      projectId: req.body.projectId,
      state: req.body.state,
    });
    await participation.save();
    res.json(participation);
  }),
);

router.patch(
  '/:participationId',
  asyncHandler(async (req, res) => {
    const participation = await Participation.findById(
      req.params.participationId,
    );
    if (!participation) {
      throw new Error('Participation not found');
    }
    if (req.body.state) {
      participation.state = req.body.state;
    }
    await participation.save();
    res.json(participation);
  }),
);

module.exports = router;
