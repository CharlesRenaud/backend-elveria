const express = require('express');
const router = express.Router();

const mapCtrl = require('../controllers/map');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.post('/', auth, multer, mapCtrl.createMap);
router.put('/:id', auth, multer, mapCtrl.modifyMap);
router.delete('/:id', auth, mapCtrl.deleteMap);
router.get('/:id', auth, mapCtrl.getOneMap);
router.get('/', auth, mapCtrl.getAllMaps);

module.exports = router;