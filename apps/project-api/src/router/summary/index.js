const express = require('express');
const asyncHandler = require('express-async-handler');
const { MongoClient, ObjectId } = require('mongodb');

const router = express.Router();

router.get(
  '/:projectId',
  asyncHandler(async (req, res) => {
    const mongo = await MongoClient.connect('mongodb://localhost:27017');
    const collection = mongo.db('develop').collection('summary');
    const summary = await collection.findOne({
      _id: new ObjectId(req.params.projectId),
    });
    if (!summary) {
      throw new Error('Project not found');
    }
    await mongo.close();
    res.json(summary);
  }),
);

module.exports = router;
