const exiftool = require('node-exiftool');
const exiftoolBin = require('dist-exiftool');
const ep = new exiftool.ExiftoolProcess(exiftoolBin);
const path = require('path');
const fs = require('fs');

let isProcessOpen = false;

exports.createSkin = async (req, res, next) => {
  try {
    const { type, level } = req.body;
    console.log(level)
    const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    const imagePath = req.file.path;
    const destinationFolder = path.join(__dirname, '..', 'images', 'equipment', `${level}`, type);
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder, { recursive: true });
    }
    const originalFileName = req.file.originalname;
    const extension = path.extname(originalFileName);
    const newFileName = `${Date.now()}_${Math.round(Math.random() * 1e9)}${extension}`;
    const destinationPath = path.join(destinationFolder, newFileName);

    await moveFile(imagePath, destinationPath);
    console.log(req.body.name)
    await addMetadata(destinationPath, {
      pseudo: req.body.name,
      date: new Date().toISOString(),
      description: req.body.description
    });
    const metadata = await extractMetadata(destinationPath);
    console.log('Métadonnées ajoutées avec succès:', metadata);
    res.status(201).json({ message: 'Skin ajouté avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la création du skin' });
  }
};

function moveFile(source, destination) {
  return new Promise((resolve, reject) => {
    fs.rename(source, destination, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

// Fonction asynchrone pour ajouter les métadonnées à l'image
async function addMetadata(imagePath, metadata) {
  try {
    if (!isProcessOpen) {
      // Démarre le processus ExifTool s'il n'est pas déjà ouvert
      await ep.open();
      isProcessOpen = true;
    }

    // Ajoute les métadonnées à l'image
    await ep.writeMetadata(imagePath, { ...metadata, 'UserComment': metadata.pseudo }, ['overwrite_original']);

    console.log('Métadonnées ajoutées avec succès:');
    console.log(metadata);

    // Extrait les métadonnées de la nouvelle image
    await extractMetadata(imagePath);
  } catch (err) {
    console.error(err);
  }
}

// Fonction asynchrone pour extraire les métadonnées de la nouvelle image
async function extractMetadata(imagePath) {
  try {
    if (!isProcessOpen) {
      // Démarre le processus ExifTool s'il n'est pas déjà ouvert
      await ep.open();
      isProcessOpen = true;
    }

    // Extrait les métadonnées de l'image
    const extractedMetadata = await ep.readMetadata(imagePath);

    console.log('Métadonnées extraites avec succès:');
    console.log(extractedMetadata);

    return extractedMetadata; // renvoie les métadonnées extraites
  } catch (err) {
    console.error(err);
  } finally {
    // Arrête le processus ExifTool si personne
    isProcessOpen = false;
    await ep.close();
  }
}
exports.getAllSkins = (req, res, next) => {
  try {
    const skins = [];
    const basePath = path.join(__dirname, '..', 'images', 'equipment');

    for (let i = 10; i <= 100; i += 10) {
      const levelPath = path.join(basePath, i.toString());
      const types = ['boots', 'helmet', 'pet', 'weapon', "chestplate"];

      types.forEach(type => {
        const typePath = path.join(levelPath, type);

        if (fs.existsSync(typePath)) {
          const images = fs.readdirSync(typePath).map(file => `${req.protocol}://${req.get('host')}/images/equipment/${i}/${type}/${file}`);
          skins.push({
            level: i,
            type,
            images
          });
        }
      });
    }
    console.log(skins);
    res.status(200).json({ skins });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des skins' });
  }
};
