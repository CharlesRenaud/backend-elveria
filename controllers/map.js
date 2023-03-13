const Map = require('../models/Map');
const fs = require('fs');
const moment = require('moment');
const jwt = require("jsonwebtoken");


exports.createMap = (req, res, next) => {
  const uploadDir = './images/';
  const imageDir = './images/map/';

  // Récupérer le nom du fichier uploadé
  const fileName = req.file.filename;

  // Construire les chemins d'accès des fichiers en fonction des informations de req
  const filePath = uploadDir + fileName;
  const filePathMove = imageDir + fileName;

  const jwToken = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(jwToken, "LE_GAMING_UNE_PASSION");
  const updatedBy = decodedToken.pseudo;
  const logPseudo = "<span id='log-pseudo'>" + updatedBy + "</span>"

  if (decodedToken.isAdmin) {
    const creator = decodedToken.pseudo;
    const updatedBy = decodedToken.pseudo;
    const lastUpdatedTime = moment(new Date()).format('DD/MM/YYYY HH:mm');

    Map.findOne({ pseudo: req.body.pseudo })
      .then(map => {
        if (map) {
          fs.unlink(filePath, (err) => {
            if (err) throw err;
            console.log(logPseudo + " <span id='log-msg'>Error : Pseudo de la map déjà utilisé, image supprimée !</span>"  + " | " +  req.body.pseudo);
            return res.status(400).json({ message: 'Le pseudo de la map est déjà pris' });
          });
        } else {
          const map = new Map({
            pseudo: req.body.pseudo,
            description: req.body.description,
            imageUrl: `https://elveria-api.devcarl.fr/images/map/${fileName}`,
            theme: req.body.theme,
            creator: creator,
            lastUpdatedTime: lastUpdatedTime,
            updatedBy: updatedBy
          });
          map.save()
            .then(() => {
              // Déplacer l'image dans le dossier /images/monster
              fs.rename(filePath, filePathMove, (err) => {
                if (err) throw err;
                console.log(logPseudo + " <span id='log-msg'>Image de la map déplacée avec succès lors de la création !</span> " + " | " + map.pseudo);
              });
              console.log(logPseudo + " <span id='log-msg'>Création d'une nouvelle map : </span>" + " | " + JSON.stringify(map).replace(/[,{}]/g, '$& |').replace(/["]/g, ''));
              res.status(201).json({ message: 'Map enregistré' });
            })
            .catch(error => res.status(400).json({ error }));
        }
      })
      .catch(error => res.status(500).json({ error }));
  } else {
    console.log(logPseudo + " <span id='log-msg'>Action non autorisée ! </span>");
    res.status(401).json({ message: 'Non autorisé à effectuer cette action, création de la map : '  + " | " +  req.body.pseudo});
  }
};

exports.modifyMap = (req, res, next) => {
  const uploadDir = './images/';
  const imageDir = './images/map/';

  let mapData = req.body;

  const jwToken = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(jwToken, "LE_GAMING_UNE_PASSION");
  const updatedBy = decodedToken.pseudo;
  const logPseudo = "<span id='log-pseudo'>" + updatedBy + "</span>"
  const lastUpdatedTime = moment(new Date()).format('DD/MM/YYYY HH:mm');

  mapData.updatedBy = updatedBy;
  mapData.lastUpdatedTime = lastUpdatedTime;

  if (req.file) {
    // Generate a new filename using the current date and time
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = new Date().getTime() + '.' + fileExt;
  
    // Remove the old image
    const mapId = req.params.id;
    Map.findOne({ _id: mapId }, (err, map) => {
      if (err) {
        console.error(err);
      } else {
        const oldImageUrl = map.imageUrl;
        if (oldImageUrl) {
          const oldImageName = oldImageUrl.split('/').pop();
          fs.unlink(imageDir + oldImageName, (err) => {
            if (err) {
              console.error(err);
            } else {
              console.log(logPseudo + " <span id='log-msg'>Ancienne image supprimée, map : </span>"  + " | " + mapData.pseudo);
            }
          });
        }
      }
    });
  
    mapData.imageUrl = `https://elveria-api.devcarl.fr/images/map/${fileName}`;
    const filePath = uploadDir + fileName;
    const filePathMove = imageDir + fileName;
    fs.rename(req.file.path, filePathMove, (err) => {
      if (err) throw err;
      console.log(logPseudo + " <span id='log-msg'>Image de la map déplacée avec succès lors de la modification !</span> "  + " | " + mapData.pseudo);
    });
  }
  

  if (decodedToken.isAdmin) {
    // Find the old map data
    Map.findOne({ _id: req.params.id }, (err, oldMapData) => {
      if (err) {
        console.error(err);
      } else {
        // Update the map data
        Map.updateOne({ _id: req.params.id }, { $set: mapData })
          .then(() => {
            res.status(200).json({ message: 'Map modifié' });
            console.log(logPseudo + " <span id='log-msg'>Map modifié avec succès !</span>" + " | " + JSON.stringify(getChanges(oldMapData, mapData)).replace(/[,{}]/g, '$& |').replace(/["]/g, ''));
          })
          .catch(error => res.status(400).json({ error }));
      }
    });
  } else {
    console.log(logPseudo + " <span id='log-msg'>Action non autorisée !</span>");
    res.status(401).json({ message: 'Non autorisé à effectuer cette action' });
  }
  
  // Helper function to get the changes between two objects
  function getChanges(oldObj, newObj) {
    const changes = {};
    for (let key in newObj) {
      if (oldObj[key] !== newObj[key]) {
        changes[key] = `${oldObj[key]} => ${newObj[key]}`;
      }
    }
    return changes;
  }
  
};

exports.deleteMap = (req, res, next) => {
  const jwToken = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(jwToken, "LE_GAMING_UNE_PASSION");
  const updatedBy = decodedToken.pseudo;
  const logPseudo = "<span id='log-pseudo'>" + updatedBy + "</span>"

  if (decodedToken.isAdmin) {
    Map.findOne({ _id: req.params.id })
      .then(map => {
        const mapName = map;
        const SafeData = mapName;
        const filePath = map.imageUrl.split('map/')[1];
        fs.unlink(`./images/map/${filePath}`, () => {
          Map.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: 'Map supprimé' });
              console.log(logPseudo + " <span id='log-msg'>Map et son image supprimée !</span>" + " | " + JSON.stringify(SafeData).replace(/[,{}]/g, '$& |').replace(/["]/g, ''));
            })
            .catch(error => res.status(400).json({ error }));
        });
      })
      .catch(error => res.status(500).json({ error }));
  } else {
    console.log(logPseudo + " <span id='log-msg'>Non autorisée a supprimer une map, tu n'es pas admin !</span>");
  }
};


exports.getOneMap = (req, res, next) => {
  Map.findOne({ _id: req.params.id })
    .then(map => res.status(200).json(map))
    .catch(error => res.status(404).json({ error }));
};

exports.getAllMaps = (req, res, next) => {
  Map.find()
    .then(maps => res.status(200).json(maps))
    .catch(error => res.status(400).json({ error }));
};
