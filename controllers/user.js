const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validUrl = require('valid-url'); // Importez la bibliothèque "valid-url" si vous ne l'avez pas déjà fait.

const User = require('../models/User');
const Equipment = require('../models/Equipment');


exports.signup = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      let image = null;
      console.log("imageUrl:" + req.body.image);

      if (req.body.image) {
        if (!validUrl.isUri(req.body.image)) {
          console.log('Invalid image URL: ' + req.body.image);
          return res.status(400).json({ error: "Invalid image URL" });
        }
        image = req.body.image;
        const fileName = path.basename(image);
        const imagePath = path.join(__dirname, '../images/user', fileName);
        if (!fs.existsSync(imagePath)) {
          console.log('Image not found: ' + imagePath);
          return res.status(400).json({ error: "Image not found" });
        }
        image = `https://elveria-api.devcarl.fr/images/user/${fileName}`;
      }
      const user = new User({
        email: req.body.email,
        pseudo: req.body.pseudo,
        password: hash,
        isAdmin: false,
        stats: {
          level: req.body.level,
          xp: req.body.xp,
          health: req.body.health,
          power: req.body.power,
          luck: req.body.luck,
          defense: req.body.defense,
        },
        gold: 100,
        imageUrl: req.body.image,
        inventory: [],
        helmet: null,
        chestplate: null,
        boots: null,
        weapon: null,
        pet: null
      });
      user.save()
        .then(() => {
          console.log('User saved: ' + user.email);
          res.status(201).json({ message: 'Utilisateur créé' })
        })
        .catch((error) => {
          console.log('Error saving user: ' + error.message);
          res.status(400).json({ error })
        });
    })
    .catch((error) => {
      console.log('Error hashing password: ' + error.message);
      res.status(500).json({ error })
    });
};



exports.login = (req, res, next) => {
  console.log("login en cours")
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect' })
          }
          const token = jwt.sign(
            { userId: user._id, pseudo: user.pseudo, isAdmin: user.isAdmin },
            'LE_GAMING_UNE_PASSION',
            { expiresIn: '24h' }
          );
          res.status(200).json({
            userId: user._id,
            pseudo: user.pseudo,
            isAdmin: user.isAdmin,
            token: token
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.modifyUser = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  try {
    const decodedToken = jwt.verify(token, 'LE_GAMING_UNE_PASSION');
    const userId = decodedToken.userId;
    console.log(decodedToken)
    console.log(decodedToken.isAdmin)
    if (userId === req.params.id || decodedToken.isAdmin) {
      User.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Utilisateur modifié' }))
        .catch(error => res.status(400).json({ error }));
    } else {
      res.status(401).json({ message: 'Non autorisé à effectuer cette action' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Non autorisé à effectuer cette action' });
  }
};
exports.deleteUser = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  try {
    const decodedToken = jwt.verify(token, 'LE_GAMING_UNE_PASSION');
    const userId = decodedToken.userId;
    if (userId === req.params.id || decodedToken.isAdmin) {
      User.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Utilisateur supprimé' }))
        .catch(error => res.status(400).json({ error }));
    } else {
      res.status(401).json({ message: 'Non autorisé à effectuer cette action' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Non autorisé à effectuer cette action' });
  }
};

exports.getUser = (req, res, next) => {
  User.findOne({ _id: req.params.id })
    .then(user => res.status(200).json(user))
    .catch(error => res.status(404).json({ error }));
};

exports.getAllUser = (req, res, next) => {
  User.find()
    .then(users => res.status(200).json(users))
    .catch(error => res.status(400).json({ error }));
};

const fs = require('fs');
const path = require('path');

exports.getImageList = (req, res, next) => {
  const directoryPath = path.join(__dirname, '../images/user');
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    return res.status(200).json({ files });
  });
};


exports.equipUser = async (req, res, next) => {
  try {
    const userId = req.body.user;
    const type = req.body.type;
    const equipmentId = req.body.equipment;

    const user = await User.findById(userId);
    const equipment = await Equipment.findById(equipmentId);

    if (!user || !equipment) {
      throw new Error('User or equipment not found');
    }

    // Check if user already has something equipped in the same type
    const currentEquipment = user.equipments[type];

    if (currentEquipment) {
      // Store current equipment in user's inventory
      user.inventory.push(currentEquipment);

      // Unequip current equipment for user
      user.equipments[type] = null;
    }

    // Equip new equipment for user
    user.equipments[type] = equipment._id;

    console.log(user.equipments)

    // Remove new equipment from user's inventory
    user.inventory = user.inventory.filter(id => id.toString() !== equipment._id.toString());


    await Promise.all([user.save(), equipment.save()]);

    res.status(200).json({
      message: 'Equipment equipped successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

exports.getAllEquipmentsOfUser = (req, res, next) => {
  const userId = req.body.id;
  User.findById(userId)
    .populate("inventory")
    .populate("equipments.helmet")
    .populate("equipments.chestplate")
    .populate("equipments.boots")
    .populate("equipments.weapon")
    .populate("equipments.pet")
    .exec((error, user) => {
      if (error) {
        return res.status(500).json({ error });
      }
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const equipments = [        user.equipments.helmet,        user.equipments.chestplate,        user.equipments.boots,        user.equipments.weapon,        user.equipments.pet,        ...user.inventory      ].filter(e => e !== null);
      res.status(200).json({ equipments });
    });
};
