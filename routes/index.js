const express = require('express');
const router = express.Router();

const indexController = require('../controllers/index');

router.get('/', indexController.getIndex);

router.get('/add-block', indexController.getAddBlock);
router.post('/add-block', indexController.postAddBlock);
router.get('/vote', indexController.getVote);
router.post('/vote', indexController.postVote);
router.get('/votetest', indexController.getVoteTest);
router.get('/login', indexController.getLogin);
router.post('/login', indexController.postLogin);
router.get('/quit', indexController.getQuit);
module.exports = router;