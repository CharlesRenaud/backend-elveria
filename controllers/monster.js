const Monster = require('../models/Monster');
const fs = require('fs');
const jwt = require("jsonwebtoken");
const moment = require('moment');
const { json } = require('body-parser');


exports.createMonster = (req, res, next) => {
  const uploadDir = './images/';
  const imageDir = './images/monster/';

  // Récupérer le nom du fichier uploadé
  const fileName = req.file.filename;

  // Construire les chemins d'accès des fichiers en fonction des informations de req
  const filePath = uploadDir + fileName;
  const filePathMove = imageDir + fileName;

  const jwToken = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(jwToken, "LE_GAMING_UNE_PASSION");
  const updatedBy = decodedToken.pseudo;
  const logPseudo = "<span id='log-pseudo'>"+ updatedBy +"</span>"

  if (decodedToken.isAdmin) {
    const creator = decodedToken.pseudo;
    const updatedBy = decodedToken.pseudo;
    const lastUpdatedTime = moment(new Date()).format('DD/MM/YYYY HH:mm');
    // Vérifier si un fichier a été uploadé
    if (!fileName) {
      console.log(logPseudo + " <span id='log-msg'> Aucun fichier n'a été chargé </span> "  + " | " + monster.pseudo);
      return res.status(400).json({ error: 'Aucun fichier image n\'a été téléchargé' });
    }
    const monster = new Monster({
      pseudo: req.body.pseudo,
      type: req.body.type,
      stats: {
        level: req.body.level,
        health: req.body.health,
        power: req.body.power,
        luck: req.body.luck,
        defense: req.body.defense,
      },
      description: req.body.description,
      imageUrl: `https://elveria-api.devcarl.fr/images/monster/${fileName}`,
      family: req.body.family,
      creator: creator,
      lastUpdatedTime: lastUpdatedTime,
      updatedBy: updatedBy,
    });
    monster.save()
      .then(() => {
        // Déplacer l'image dans le dossier /images/monster
        fs.rename(filePath, filePathMove, (err) => {
          if (err) {
            console.error(err);
            fs.unlink(filePath, () => {
              console.log(logPseudo + " <span id='log-msg'> Une erreur est survenue lors du déplacement de l'image ! </span> "  + " | " + monster.pseudo);
              return res.status(500).json({ error: 'Une erreur est survenue lors du déplacement de l\'image' });
            });
          }
          console.log(logPseudo + " <span id='log-msg'>Image déplacé avec succès lors de la création du monstre</span> " + " | " + monster.pseudo);
          console.log(logPseudo + " <span id='log-msg'>Monstre enregistré avec succès !</span>" + ' | ' + JSON.stringify(monster).replace(/[,{}]/g, '$& |').replace(/["]/g, ''));
          return res.status(201).json({ message: 'Monstre enregistré' });
        });
      })
      .catch(error => {
        fs.unlink(filePath, () => {
          console.log(logPseudo + " <span id='log-msg'>Error : Image de monstre importé supprimée !</span> "  + " | " + monster.pseudo);
          res.status(400).json({ error });
        });
      });
  } else {
    console.log(logPseudo  + " <span id='log-msg'>Error : Non Autorisé à Créer le monstre : </span>" + " | " + req.body.pseudo);
    res.status(401).json({ message: 'Non autorisé à effectuer cette action' });
  }
};


exports.modifyMonster = (req, res, next) => {
  const uploadDir = "./images/";
  const imageDir = "./images/monster/";

  const jwToken = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(jwToken, "LE_GAMING_UNE_PASSION");
  const updatedBy = decodedToken.pseudo;
  const logPseudo = "<span id='log-pseudo'>"+ updatedBy +"</span>"

  let monsterData = {
    pseudo: req.body.pseudo,
    type: req.body.type,
    stats: {
      level: JSON.parse(req.body.stats).level,
      health: JSON.parse(req.body.stats).health,
      power: JSON.parse(req.body.stats).power,
      luck: JSON.parse(req.body.stats).luck,
      defense: JSON.parse(req.body.stats).defense,
    },
    description: req.body.description,
    family: req.body.family,
  };

  if (req.file) {
    const jwToken = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(jwToken, "LE_GAMING_UNE_PASSION");

    if (decodedToken.isAdmin) {
      const fileName = req.file.filename;
      monsterData.imageUrl = `https://elveria-api.devcarl.fr/images/monster/${fileName}`;

      const filePath = uploadDir + fileName;
      const filePathMove = imageDir + fileName;

        // Vérification si l'image existe déjà et suppression de l'ancienne image si elle existe
        Monster.findById(req.params.id)
        .then((currentMonster) => {
          if (currentMonster.imageUrl) {
            const imagePath = imageDir + currentMonster.imageUrl.split('/').pop();
            if (fs.existsSync(imagePath)) {
              fs.unlink(imagePath, (err) => {
                if (err) throw err;
                console.log(logPseudo  + " <span id='log-msg'> Ancienne image supprimée !</span>"  + " | " + monsterData.pseudo);
              });
            }
          }


          // Déplacement de la nouvelle image
          fs.rename(req.file.path, filePathMove, (err) => {
            if (err) throw err;
            console.log(logPseudo  + " <span id='log-msg'>Image déplacé dans le bon dossier !</span>"  + " | " + monsterData.pseudo);
          });
        })
        .catch((error) => console.log(error));
    } else {
      console.log(logPseudo  + " <span id='log-msg'>Error : Non Autorisé à modifier : </span>" + " | " + monsterData.pseudo);
      return res.status(401).json({ message: 'Non autorisé à effectuer cette action' });
    }
  }

  const lastUpdatedTime = moment(new Date()).format('DD/MM/YYYY HH:mm');

  monsterData.updatedBy = updatedBy;
  monsterData.lastUpdatedTime = lastUpdatedTime;

  if (decodedToken.isAdmin) {
    // Récupération du monstre actuel dans la base de données
    Monster.findById(req.params.id)
      .then((currentMonster) => {
        // Modification du monstre avec les nouvelles données
        Monster.updateOne({ _id: req.params.id }, { ...monsterData })
          .then(() => {
            // Récupération du monstre modifié dans la base de données
            Monster.findById(req.params.id)
              .then((updatedMonster) => {
                // Comparaison des valeurs pour déterminer quelles propriétés ont été modifiées
                const changes = [];
                for (const key in monsterData) {
                  if (typeof monsterData[key] === "object") {
                    for (const prop in monsterData[key]) {
                      if (monsterData[key][prop] !== currentMonster[key][prop]) {
                        if (`${key}.${prop}` !== 'lastUpdatedTime') {
                          changes.push(`${key}.${prop}: ${currentMonster[key][prop]} => ${monsterData[key][prop]}`);
                        }
                      }
                    }
                  } else {
                    if (monsterData[key] !== currentMonster[key]) {
                      if (key !== 'lastUpdatedTime') {
                        changes.push(`${key}: ${currentMonster[key]} => ${monsterData[key]}`);
                      }
                    }
                  }
                }
                const changesString = changes.join(" | ");
                console.log(`${logPseudo} <span id='log-msg'> A modifié les propriétés suivantes du monstre : </span> ${updatedMonster.pseudo}: | ${changesString}`);
                res.status(200).json({ message: "Monstre modifié avec succès !" });
              })
              .catch((error) => res.status(400).json({ error }));
          })
          .catch((error) => res.status(400).json({ error }));
      })
      .catch((error) => res.status(400).json({ error }));
  } else {
    console.log(logPseudo + " <span id='log-msg'>Non Autorisé a modifier : </span> " + " | " + monsterData.pseudo);
    res.status(401).json({ message: 'Non autorisé à effectuer cette action' });
  }
  
};



exports.deleteMonster = (req, res, next) => {
  const jwToken = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(jwToken, "LE_GAMING_UNE_PASSION");
  const updatedBy = decodedToken.pseudo;
  const logPseudo = "<span id='log-pseudo'>"+ updatedBy +"</span>"

  Monster.findOne({ _id: req.params.id })
    .then(monster => {
      const filePath = monster.imageUrl.split('monster/')[1];
      const jwToken = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(jwToken, "LE_GAMING_UNE_PASSION");
      
      if (decodedToken.isAdmin) {
        fs.unlink(`./images/monster/${filePath}`, () => {
          Monster.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: 'Monstre supprimé' }); 
              console.log(logPseudo + " <span id='log-msg'>Monstre et son image, supprimées : </span>" + monster.pseudo + ' | ' + JSON.stringify(monster).replace(/[,{}]/g, '$& |').replace(/["]/g, '')) 
            })
            .catch(error => res.status(400).json({ error }));
        });
      } else {
        res.status(401).json({ message: 'Non autorisé à effectuer cette action' });
        console.log(logPseudo + " <span id='log-msg'> Non Autorisé a supprimer : </span>"   + monster.pseudo);
      }
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getOneMonster = (req, res, next) => {
  Monster.findOne({ _id: req.params.id })
    .then(monster => res.status(200).json(monster))
    .catch(error => res.status(404).json({ error }));
};

exports.getAllMonsters = (req, res, next) => {
  Monster.find()
    .then(monsters => res.status(200).json(monsters))
    .catch(error => res.status(400).json({ error }));
};
