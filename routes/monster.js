const express = require('express');
const router = express.Router();

const monsterCtrl = require('../controllers/monster');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.post('/', auth, multer, monsterCtrl.createMonster);
router.put('/:id', auth, multer, monsterCtrl.modifyMonster);
router.delete('/:id', auth, monsterCtrl.deleteMonster);
router.get('/:id', auth, monsterCtrl.getOneMonster);
router.get('/', auth, monsterCtrl.getAllMonsters);

module.exports = router;