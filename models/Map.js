const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const mapSchema = mongoose.Schema({
  pseudo: { type: String, required: true, unique : true },
  description: { type: String},
  imageUrl: { type: String, required: true },
  theme: { type: String},
  creator: { type: String},
  lastUpdatedTime: { type: String},
  updatedBy: { type: String},
});

mapSchema.plugin(uniqueValidator);


module.exports = mongoose.model('Map', mapSchema);