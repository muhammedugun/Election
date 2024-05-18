const express = require('express');
const router = express.Router();

const indexController = require('../controllers/index');

router.get('/', indexController.getHome);

router.get('/vote', indexController.getNewVote);
router.post('/vote', indexController.postVote);
router.get('/login', indexController.getLogin);
router.post('/login', indexController.postLogin);
router.get('/blockchain', indexController.getBlockchain);
router.get('/quit', indexController.getQuit);
module.exports = router;