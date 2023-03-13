const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const monsterSchema = mongoose.Schema({
  pseudo: { type: String, required: true, unique : true},
  type: { type: String, required: true },
  stats : {
    level: { type: Number, required: true},
    health: { type: Number, required: true}, // Points de vies
    power: { type: Number, required: true}, // Puissance de frappe
    luck: { type: Number, required: true}, // Taux de critiques
    defense: { type: Number, required: true} // Resistance du joueur
  },
  description: { type: String},
  imageUrl: { type: String, required: true },
  family: { type: String},
  creator: { type: String},
  lastUpdatedTime: { type: String},
  updatedBy: { type: String}
});

monsterSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Monster', monsterSchema);