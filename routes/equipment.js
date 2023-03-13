const express = require('express');
const router = express.Router();

const equipmentCtrl = require('../controllers/equipment');
const skinCtrl = require('../controllers/skin');

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');



router.post('/', auth, multer, equipmentCtrl.createEquipment);
router.put('/:id', auth, multer, equipmentCtrl.modifyEquipment);
router.delete('/:id', auth, equipmentCtrl.deleteEquipment);
router.get('/details/:id', auth, equipmentCtrl.getOneEquipment);
router.get('/', auth, equipmentCtrl.getAllEquipments);

router.post('/create-skin', auth, multer, skinCtrl.createSkin);
router.get('/skins', auth, skinCtrl.getAllSkins);

module.exports = router;