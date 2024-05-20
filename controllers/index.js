const Block = require('../models/block');
const User = require('../models/user');
const Party = require('../models/party');
const Blockhain = require('../public/javascripts/blockchain');


let currentUser = null;
let isLogin=false;

exports.getHome = async (req, res, next) => {

    if(currentUser != null) {
        console.log("index: " + currentUser.name);
    } else {
        console.log("currentuser is null");
    }

    try {
        const [partyResults] = await Party.getAll();
        const parties = partyResults;
        
        const voteCounts = {};

        for (const party of parties) {
            const [voteResult] = await Block.getVoteCount(party.id);
            voteCounts[party.id] = voteResult[0].count;
        }

        if(currentUser!=null)
        {
            res.render('home', {
                title: 'Home',
                path: '/home',
                isLogin: true,
                name: currentUser.name,
                surname: currentUser.surname,
                parties: parties,
                voteCounts: voteCounts
            });
        }
        else
        {
            res.render('home', {
                title: 'Home',
                path: '/home',
                isLogin: false,
                parties: parties,
                voteCounts: voteCounts
            });
        }

        
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};


exports.getVote = (req, res, next) => {
    if(currentUser != null) {
        console.log("index: " + currentUser.name);
        isLogin=true;
    } else {
        console.log("currentuser is null");
        isLogin=false;
    }

    Party.getAll()
        .then(results => {

            res.render('vote', {
                title: 'Vote',
                path:'/vote',
                isLogin: isLogin,
                parties: results[0]
            }); 
        })
        .catch((err) => {
            console.log(err);
        });
}


exports.postVote = (req, res, next) => {

    const partyId = req.body.partyId;

    const block = new Block(partyId);

    block.countCompleted().then(() => {
        // Burası Block.count() işlemi tamamlandıktan sonra çalışacak
        return block.saveBlock();
            }).then(() => {

                Block.getAll()
                .then(blocks => {
                    //var newBlocks = JSON.stringify(blocks[0]);
                    var newBlocks2 = Blockhain.mine(blocks[0], blocks[0].length-1);
                    Block.UpdateAll(newBlocks2);
                    res.redirect('/vote');
                })
                .catch((err) => {
                    console.log(err);
                });
                
            }).catch((err) => {
                console.log(err);
    });
}

exports.getLogin = (req, res, next) => {

    res.render('login', {
        title: 'Login',
        path:'/login',
        isLogin: true,
    }); 
}

exports.postLogin = (req, res, next) => {

    User.getByTC(req.body.tc)
        .then((user) => {

            const { tc, name, surname } = req.body;

            let lastUser = new User(tc, name, surname);
            
            if(user[0][0].name==lastUser.name && user[0][0].surname==lastUser.surname)
            {
                currentUser = lastUser;
                console.log("Succesfull login");
                res.redirect('/');
            }
            else
            {
                console.log("Failed login");
                res.redirect('/login');
            }

            

        })
        .catch((err) => {
            console.log("Kullanici bulunamadi");
            res.redirect('/login');
            console.log(err);
        });

}

exports.getBlockchain = (req, res, next) => {
    if(currentUser!=null)
        console.log("index: " + currentUser.name);
    else
    console.log("currentuser is null");

    Block.getAll()
        .then(blocks => {

            var newBlocks = Blockhain.updateChain(blocks[0], 0);
            Block.UpdateAll(newBlocks);

            res.render('blockchain', {
                title: 'Blockhain',
                path:'/',
                isLogin: false,
                blocks: blocks[0]
            });
        })
        .catch((err) => {
            console.log(err);
        });
}


exports.getLogout = (req, res, next) => {
    currentUser = null;
    
    getHome(req, res, next);
}