const mongoose = require('mongoose');
const { Schema } = mongoose; // Add this line

const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, unique: true },
  pseudo: { type: String, unique: true },
  password: { type: String },
  isAdmin: { type: Boolean },
  stats: {
    level: { type: Number },
    xp: { type: Number },
    health: { type: Number },
    power: { type: Number },
    luck: { type: Number },
    defense: { type: Number }
  },
  gold: { type: Number},
  imageUrl: { type: String},
  inventory: [{
    type: Schema.Types.ObjectId, ref: 'Equipment'
  }],
  equipments : {
    helmet: { type: Schema.Types.ObjectId, ref: 'Equipment' },
    chestplate: { type: Schema.Types.ObjectId, ref: 'Equipment' },
    boots: { type: Schema.Types.ObjectId, ref: 'Equipment' },
    weapon: { type: Schema.Types.ObjectId, ref: 'Equipment' },
    pet: { type: Schema.Types.ObjectId, ref: 'Equipment' },
  }
});


userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);