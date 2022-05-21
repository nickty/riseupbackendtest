const mongoose = require('mongoose');

const { model, Schema } = mongoose;

mongoose.connect('mongodb://localhost:27017/develop');

/**
 * @typedef {object} IProject
 * @property {string} name
 */

/** @type {import('mongoose').Schema<IProject>} */
const schema = new Schema({
  name: { type: String, required: true },
});

const Project = model('Project', schema);

module.exports = Project;
