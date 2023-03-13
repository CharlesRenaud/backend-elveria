const fs = require('fs');
const path = require('path');

const logFilePath = path.resolve(__dirname, '../app.log');

exports.getLogs = async (req, res, next) => {
  try {
    // Lire le contenu du fichier de journalisation
    const logFileContent = fs.readFileSync(logFilePath, 'utf8');

    // Renvoyer le contenu du fichier de journalisation dans la réponse HTTP
    res.send(logFileContent);
  } catch (err) {
    // Gérer les erreurs
    console.error(`Erreur lors de la lecture du fichier de journalisation : ${err}`);
    res.status(500).send('Erreur lors de la lecture du fichier de journalisation.');
  }
};
