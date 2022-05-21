const mongoose = require('mongoose');

const { Schema, model } = mongoose;

mongoose.connect('mongodb://localhost:27017/develop');

/**
 * @typedef {'ACTIVE' | 'ENDED'} State
 */

/**
 * @typedef {object} IParticipation
 * @property {import('mongoose').Types.ObjectId} projectId
 * @property {State} state
 */

/** @type {import('mongoose').Schema<IParticipation>} */
const schema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  state: { type: String, enum: ['ACTIVE', 'ENDED'], required: true },
});

const Participation = model('Participation', schema);

module.exports = Participation;
