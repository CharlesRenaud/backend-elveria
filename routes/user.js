const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');

router.post('/signup', multer, userCtrl.signup);
router.post('/login', userCtrl.login);

router.put('/:id', auth, multer, userCtrl.modifyUser);
router.delete('/:id', auth, userCtrl.deleteUser);
router.get('/:id', auth, userCtrl.getUser);
router.get('/', auth, userCtrl.getAllUser);
router.get('/images/user', userCtrl.getImageList);
router.put('/equip/stuff', auth, userCtrl.equipUser);
router.post('/equip/list', auth, userCtrl.getAllEquipmentsOfUser);

module.exports = router;

