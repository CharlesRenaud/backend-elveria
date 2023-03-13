const path = require('path');
const moment = require('moment');
const fs = require('fs');
const Skin = require('../models/Skin');
const User = require('../models/User');
const Equipment = require('../models/Equipment');

async function getRandomSkinByTypeAndLevel(type, level) {
    console.log(type + level);
    const folderLevel = Math.ceil(level / 10) * 10;
    console.log(folderLevel)
    const skins = await Skin.find({ type: type, level: folderLevel});
    if (skins.length === 0) {
        throw new Error('No skin found for the specified type and level');
    }
    const randomIndex = Math.floor(Math.random() * skins.length);
    return skins[randomIndex];
}

function calculPrix(rarete, niveau) {
    let priceBase = 5; // prix de base pour un équipement commun de niveau 1
    let rareteCoeff = 0; // coefficient de rareté
    switch(rarete) {
      case 'common':
        rareteCoeff = 0;
        break;
      case 'rare':
        rareteCoeff = 0.05;
        break;
      case 'legendary':
        rareteCoeff = 0.15;
        break;
      case 'divine':
        rareteCoeff = 0.25;
        break;
      default:
        throw new Error('Rareté invalide');
    }
    let price = priceBase * (1 + rareteCoeff) * (1 + niveau * 0.1);
    return Math.ceil(price);
  }

  exports.createEquipment = async (req, res, next) => {
    const equipmentObject = req.body.equipment;
  
    delete equipmentObject._id;
  
    const userId = req.userId;
  
    const level = equipmentObject.stats.level;
    const type = generateEquipmentType();
    const rarity = generateRarity();
  
    const creationDate = moment(new Date()).format('DD/MM/YYYY HH:mm');
  
    const stats = {
      health: generateStatValue(level, rarity),
      power: generateStatValue(level, rarity),
      luck: generateStatValue(level, rarity),
      defense: generateStatValue(level, rarity),
    };
  
    addRandomStats(stats, level, rarity);
  
    // Récupérer un skin aléatoire en fonction du type et du niveau
    const skin = await getRandomSkinByTypeAndLevel(type, level);
    const name = skin.pseudo;
    const description = skin.description;
    const imageUrl = skin.imageUrl;
  
    const price = calculPrix(rarity, level);
  
    const equipment = new Equipment({
      pseudo: name,
      description: description,
      imageUrl: imageUrl,
      stats: {
        level: req.body.equipment.stats.level,
        health: stats.health,
        power: stats.power,
        luck: stats.luck,
        defense: stats.defense,
      },
      type: type,
      rarity: rarity,
      price: price,
      creator: userId,
      creationDate: creationDate
    });
  
    try {
      await equipment.save();
      const user = await User.findById(userId);
      user.inventory.push(equipment._id);
      await user.save();
      res.status(201).json({ message: 'Equipment enregistré' });
    } catch (error) {
      console.error('Error creating equipment:', error);
      await equipment.remove();
      res.status(500).json({ error: 'Erreur lors de la création de l\'équipement.' });
    }
  };
  

// Fonction pour générer un type d'équipement aléatoire en fonction des types disponibles
function generateEquipmentType() {
    const types = ['helmet', 'chestplate', 'boots', 'weapon', 'pet'];
    const randomIndex = Math.floor(Math.random() * types.length);
    console.log(types[randomIndex])
    return types[randomIndex];
}

// Fonction pour générer une rareté aléatoire en fonction des probabilités
function generateRarity() {
    const probabilities = [{ rarity: 'common', probability: 0.5 }, { rarity: 'rare', probability: 0.39 }, { rarity: 'legendary', probability: 0.1 }, { rarity: 'divine', probability: 0.01 }];
    const randomValue = Math.random();
    let cumulativeProbability = 0;

    for (let i = 0; i < probabilities.length; i++) {
        cumulativeProbability += probabilities[i].probability;

        if (randomValue <= cumulativeProbability) {
            return probabilities[i].rarity;
        }
    }

    return 'common';
}

// Fonction pour générer une valeur de statistique aléatoire en fonction du niveau et de la rareté
function generateStatValue(level, rarity) {
    const baseValue = level * 1.5;
    const rarityMultiplier = getRarityMultiplier(rarity);
    const randomMultiplier = 1 + (Math.random() - 0.5) * 0.2; // Ajoute une variation aléatoire de 10% maximum
    const value = Math.floor(baseValue * rarityMultiplier * randomMultiplier);
    return value;
}

// Fonction pour ajouter des statistiques aléatoires à l'équipement
function addRandomStats(stats, level, rarity) {
    const availableStats = ['health', 'power', 'luck', 'defense'];
    const numStats = level < 25 ? 2 : level < 75 ? 3 : 4;
    const bonusStats = [];

    for (let i = 0; i < numStats; i++) {
        const randomIndex = Math.floor(Math.random() * availableStats.length);
        const stat = availableStats[randomIndex];
        const rarityMultiplier = getRarityMultiplier(rarity);
        const randomMultiplier = 1 + (Math.random() - 0.5) * 0.2;
        stats[stat] = Math.floor(generateStatValue(level, rarity) * (0.1 + rarityMultiplier) * randomMultiplier);

        if (i < 2) {
            bonusStats.push(stat);
        }

        availableStats.splice(randomIndex, 1);
    }

    availableStats.forEach(stat => {
        stats[stat] = 0;
    });

    bonusStats.forEach(stat => {
        stats[stat] += Math.floor(generateStatValue(level, rarity) * 0.5);
    });
}

// Fonction pour obtenir le multiplicateur de rareté des statistiques
function getRarityMultiplier(rarity) {
    switch (rarity) {
        case 'common':
            return 1;
        case 'rare':
            return 1.15;
        case 'legendary':
            return 1.35;
        case 'divine':
            return 1.6;
        default:
            return 1;
    }
}

exports.modifyEquipment = async (req, res, next) => {
    const equipmentId = req.params.id;
    const { pseudo, description, imageUrl, stats, type, rarity } = req.body;
  
    // Vérifier si l'équipement existe
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment non trouvé' });
    }
  
    // Vérifier si l'utilisateur est autorisé à modifier l'équipement
    if (equipment.creator.toString() !== req.userId && !req.isAdmin ) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier cet équipement' });
    }
  
    // Mettre à jour les champs
    equipment.pseudo = pseudo;
    equipment.description = description;
    equipment.stats = stats;
    equipment.type = type;
    equipment.rarity = rarity;
  
    // Mettre à jour l'image si nécessaire
    if (imageUrl !== equipment.imageUrl) {
      const imagePath = path.join(__dirname, '..', equipment.imageUrl);
      fs.unlink(imagePath, err => {
        if (err) {
          console.log(err);
        }
      });
      equipment.imageUrl = imageUrl;
    }
  
    // Enregistrer les modifications
    equipment.save()
      .then(() => res.status(200).json({ message: 'Equipment modifié' }))
      .catch(error => res.status(400).json({ error }));
  };
  

  exports.deleteEquipment = (req, res, next) => {
    Equipment.findById(req.params.id)
      .then(equipment => {
        if (!equipment) {
          return res.status(404).json({ error: "Equipment not found" });
        }
        User.updateOne(
          {
            $or: [
              { "equipments.helmet": req.params.id },
              { "equipments.chestplate": req.params.id },
              { "equipments.boots": req.params.id },
              { "equipments.weapon": req.params.id },
              { "equipments.pet": req.params.id },
              { inventory: { $in: [req.params.id] } }
            ]
          },
          {
            $unset: {
              "equipments.helmet": req.params.id,
              "equipments.chestplate": req.params.id,
              "equipments.boots": req.params.id,
              "equipments.weapon": req.params.id,
              "equipments.pet": req.params.id,
            },
            $pull: {
              inventory: req.params.id
            }
          }
        )
          .then(() => {
            Equipment.findByIdAndDelete(req.params.id)
              .then(() => res.status(200).json({ message: "Equipment deleted" }))
              .catch(error => res.status(500).json({ error }));
          })
          .catch(error => res.status(500).json({ error }));
      })
        .catch(error => res.status(500).json({ error }));
};


exports.getOneEquipment = (req, res, next) => {
    Equipment.findOne({ _id: req.params.id })
        .then(equipment => res.status(200).json(equipment))
        .catch(error => res.status(404).json({ error }));
};

exports.getAllEquipments = (req, res, next) => {
    Equipment.find()
        .then(equipments => res.status(200).json(equipments))
        .catch(error => res.status(400).json({ error }));
};