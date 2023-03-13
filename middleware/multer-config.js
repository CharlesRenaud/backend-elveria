const multer = require('multer');
const jwt = require('jsonwebtoken');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images')
  },
  filename: (req, file, callback) => {
    console.log(file + "file")
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decodedToken = jwt.verify(token, 'LE_GAMING_UNE_PASSION');
      const updatedBy = decodedToken.pseudo;
      const logPseudo = "<span id='log-pseudo'>"+ updatedBy +"</span>"    
      if (decodedToken.isAdmin) {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
      } else {
        console.log(logPseudo + " <span id='log-msg'> Hola c'est la sécu des upload d'images, tu n'es pas admin ... </span>");
        throw new Error('Non autorisé à effectuer cette action');
      }
    } catch (error) {
      callback(error);
    }
  }
});

module.exports = multer({ storage }).single('image');
