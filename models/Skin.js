const mongoose = require('mongoose');
const { Schema } = mongoose; // Add this line

const skinSchema = mongoose.Schema({
  pseudo: { type: String},
  description: { type: String},
  level: { type: Number},
  imageUrl: { type: String},
  type : { type: String, enum: ['helmet', 'chestplate', 'boots', 'weapon', 'pet'] },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  creationDate: {type: String},
});

module.exports = mongoose.model('Skin', skinSchema);
