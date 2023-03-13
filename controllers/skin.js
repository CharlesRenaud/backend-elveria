const path = require('path');
const fs = require('fs');
const Skin = require('../models/Skin');
const moment = require('moment');

exports.createSkin = async (req, res, next) => {
  const uploadDir = './images/';
  const skinDir = './images/equipment/';

  // Récupérer le nom du fichier uploadé
  const fileName = req.file.filename;

  // Construire les chemins d'accès des fichiers en fonction des informations de req
  const filePath = uploadDir + fileName;
  const filePathMove = skinDir + req.body.level + '/' + req.body.type + '/' + fileName;

  const creator = req.userId;
  const creationDate = moment().format('DD/MM/YYYY');

  const skin = new Skin({
    pseudo: req.body.pseudo,
    description: req.body.description,
    imageUrl: `https://elveria-api.devcarl.fr/images/equipment/${req.body.level}/${req.body.type}/${fileName}`,
    type: req.body.type,
    level: req.body.level,
    creator: creator,
    creationDate: creationDate
  });
  skin.save()
    .then(() => {
      // Déplacer l'image dans le dossier /images/equipment/level/type
      fs.rename(filePath, filePathMove, (err) => {
        if (err) throw err;
        console.log("Image du skin déplacée avec succès lors de la création !");
      });
      res.status(201).json({ message: 'Skin enregistré' });
    })
    .catch(error => res.status(400).json({ error }));
};

exports.modifySkin = async (req, res, next) => {
  const uploadDir = './images/';
  const skinDir = './images/equipment/';

  let skinData = req.body;

  const lastUpdatedTime = moment(new Date()).format('DD/MM/YYYY HH:mm');

  skinData.lastUpdatedTime = lastUpdatedTime;

  if (req.file) {
    // Generate a new filename using the current date and time
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = new Date().getTime() + '.' + fileExt;

    // Remove the old image
    const skinId = req.params.id;
    Skin.findOne({ _id: skinId }, (err, skin) => {
      if (err) {
        console.error(err);
      } else {
        const oldImageUrl = skin.imageUrl;
        if (oldImageUrl) {
          const oldImageName = oldImageUrl.split('/').pop();
          fs.unlink(skinDir + skin.level + '/' + skin.type + '/' + oldImageName, (err) => {
            if (err) {
              console.error(err);
            } else {
              console.log("Ancienne image supprimée !");
            }
          });
        }
      }
    });

    skinData.imageUrl = `https://elveria-api.devcarl.fr/images/equipment/${skinData.level}/${skinData.type}/${fileName}`;
    const filePath = uploadDir + fileName;
    const filePathMove = skinDir + skinData.level + '/' + skinData.type + '/' + fileName;
    fs.rename(req.file.path, filePathMove, (err) => {
      if (err) throw err;
      console.log("Image du skin déplacée avec succès lors de la modification !");
    });
  }
  // Find the old skin data
  Skin.findOne({ _id: req.params.id }, (err, oldSkinData) => {
    if (err) {
      console.error(err);
    } else {
      // Update the skin data
      Skin.updateOne({ _id: req.params.id }, { $set: skinData })
        .then(() => {
          res.status(200).json({ message: 'Skin modifié' });
          console.log("Skin modifié avec succès !");
        })
        .catch(error => res.status(400).json({ error }));
    }
  });
};

exports.deleteSkin = async (req, res, next) => {
  const skinId = req.params.id;
  Skin.findOne({ _id: skinId })
    .then(skin => {
      const skinName = skin;
      const SafeData = skinName;
      const filePath = skin.imageUrl.split('skin/')[1];
      fs.unlink(`./images/skin/${filePath}`, () => {
        Skin.deleteOne({ _id: skinId })
          .then(() => {
            res.status(200).json({ message: 'Skin supprimé' });
            console.log("Skin et son image supprimée !");
          })
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getAllSkins = (req, res, next) => {
  Skin.find()
    .then(skins => res.status(200).json(skins))
    .catch(error => res.status(400).json({ error }));
};
