const Block = require('../models/block');
const User = require('../models/user');
const Party = require('../models/party');
const Blockchain = require('../public/javascripts/blockchain');
const { render } = require('pug');

let currentUser = null;

exports.getHome = async (req, res, next) => {
    console.log(currentUser ? `index: ${currentUser.name}` : 'currentUser is null');

    try {
        const [partyResults] = await Party.getAll();
        const parties = partyResults;
        const voteCounts = {};

        for (const party of parties) {
            const [voteResult] = await Block.getVoteCount(party.id);
            voteCounts[party.id] = voteResult[0].count;
        }

        res.render('home', {
            title: 'Home',
            path: '/home',
            isLogin: currentUser !== null,
            name: currentUser ? currentUser.name : '',
            surname: currentUser ? currentUser.surname : '',
            parties: parties,
            voteCounts: voteCounts
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getVote = async (req, res, next) => {
    console.log(currentUser ? `index: ${currentUser.name}` : 'currentUser is null');

    try {
        const [parties] = await Party.getAll();
        res.render('vote', {
            title: 'Vote',
            path: '/vote',
            isLogin: currentUser !== null,
            name: currentUser ? currentUser.name : '',
            surname: currentUser ? currentUser.surname : '',
            parties: parties
        });
    } catch (err) {
        console.error(err);
    }
};

exports.postVote = async (req, res, next) => {
    if(currentUser==null)
    {
        res.redirect('/login');     
    }
    else
    {
        const partyId = req.body.partyId;
        const block = new Block(partyId);
    
        try {
            await block.countCompleted();
            await block.saveBlock();
            const [blocks] = await Block.getAll();
            const updatedBlocks = Blockchain.mine(blocks, blocks.length - 1);
            await Block.UpdateAll(updatedBlocks);
            res.redirect('/vote');
        } catch (err) {
            console.error(err);
        }
    }
};

exports.getLogin = (req, res, next) => {
    res.render('login', {
        title: 'Login',
        isLogin: false,
    });
};

exports.postLogin = async (req, res, next) => {
    const { tc, name, surname } = req.body;

    try {
        const [user] = await User.getByTC(tc);

        if (user.length > 0 && user[0].name === name && user[0].surname === surname) {
            currentUser = new User(tc, name, surname);
            console.log('Successful login');
            res.redirect('/');
        } else {
            console.log('Failed login');
            res.redirect('/login');
        }
    } catch (err) {
        console.log('User not found');
        res.redirect('/login');
        console.error(err);
    }
};

exports.getBlockchain = async (req, res, next) => {
    console.log(currentUser ? `index: ${currentUser.name}` : 'currentUser is null');

    try {
        const [blocks] = await Block.getAll();
        const updatedBlocks = Blockchain.updateChain(blocks, 0);
        await Block.UpdateAll(updatedBlocks);
        res.render('blockchain', {
            title: 'Blockchain',
            path: '/blockchain',
            isLogin: currentUser !== null,
            name: currentUser ? currentUser.name : '',
            surname: currentUser ? currentUser.surname : '',
            blocks: blocks
        });
    } catch (err) {
        console.error(err);
    }
};

exports.getLogout = (req, res, next) => {
    currentUser = null;
    this.getHome(req, res, next);
};
