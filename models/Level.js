const mongoose = require('mongoose');
const { Schema } = mongoose; // Add this line
const uniqueValidator = require('mongoose-unique-validator');

const sceneSchema = mongoose.Schema({
  dialogue: { type: String },
  monsterIds: [{ type: Schema.Types.ObjectId, ref: 'Monster' }],
  combatMap: { type: Schema.Types.ObjectId, ref: 'Map' },
});

const levelSchema = mongoose.Schema({
  acte: {type: Number},
  chapter: {type: Number},
  pseudo: { type: String},
  scenes: [sceneSchema],
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

levelSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Level', levelSchema);
