const mongoose = require('mongoose');
const { Schema } = mongoose; // Add this line
const uniqueValidator = require('mongoose-unique-validator');

const equipmentSchema = mongoose.Schema({
  pseudo: { type: String},
  description: { type: String},
  imageUrl: { type: String},
  stats : {
    level: { type: Number},
    health: {  type: Number}, // Points de vies
    power: {  type: Number}, // Puissance de frappe
    luck: {  type: Number}, // Taux de critiques
    defense: {  type: Number} // Resistance du joueur
  },
  type : { type: String, enum: ['helmet', 'chestplate', 'boots', 'weapon', 'pet'] },
  rarity: { type: String, enum: ['common', 'rare', 'legendary', 'divine']},
  price: { type: Number},
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  creationDate: {type: String},
});

equipmentSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Equipment', equipmentSchema);
