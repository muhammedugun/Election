const express = require('express');
const router = express.Router();

const indexController = require('../controllers/index');

router.get('/', indexController.getIndex);
router.get('/home', indexController.getHome);
router.get('/login', indexController.getLogin);
router.post('/login', indexController.postLogin);
router.get('/vote', indexController.getVote);
router.post('/vote', indexController.postVote);
router.get('/blockchain', indexController.getBlockchain);
router.get('/logout', indexController.getLogout);
module.exports = router;