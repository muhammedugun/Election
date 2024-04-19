const Block = require('../models/block');
const User = require('../models/user');
const Blockhain = require('../public/javascripts/blockchain');


let currentUser = null;

exports.getIndex = (req, res, next) => {
    if(currentUser!=null)
        console.log("index: " + currentUser.name);
    else
    console.log("currentuser is null");

    Block.getAll()
        .then(blocks => {
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


exports.getAddBlock = (req, res, next) => {
    Block.getAll()
        .then(blocks => {
            res.render('add-block', {
                title: 'AddBlock',
                blocks: blocks[0]
            });
        })
        .catch((err) => {
            console.log(err);
        });

}


exports.postAddBlock = (req, res, next) => {
    const block = new Block();

    block.nonce = req.body.nonce;
    block.previous = req.body.previous;

    block.saveBlock()
        .then(() => {
            res.redirect('/');
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.getVote = (req, res, next) => {
    if(currentUser!=null)
    console.log("vote: " + currentUser.name);
else
console.log("currentuser is null");

    res.render('vote', {
        title: 'Vote',
        path:'/vote',
        isLogin: true,
    }); 
}

exports.postVote = (req, res, next) => {

    const block = new Block(currentUser.tc, req.body.vote);

    block.countCompleted().then(() => {
        // Burası Block.count() işlemi tamamlandıktan sonra çalışacak
        return block.saveBlock();
    }).then(() => {


        Block.getAll()
        .then(blocks => {
            //var newBlocks = JSON.stringify(blocks[0]);
            var newBlocks2 = Blockhain.mineVote(blocks[0], blocks[0].length-1);
            Block.UpdateAll(newBlocks2);
        })
        .catch((err) => {
            console.log(err);
        });


        res.redirect('/vote');
    }).catch((err) => {
        console.log(err);
    });

    



    
}

exports.getVoteTest = (req, res, next) => {

    res.render('vote-test', {
        title: 'VoteTest',
        path:'/votetest',
        isLogin: true,
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
            }
            else
            {
                console.log("Failed login");
            }

            res.redirect('/login');

        })
        .catch((err) => {
            console.log("Kullanici bulunamadi");
            res.redirect('/login');
            console.log(err);
        });

}


exports.getQuit = (req, res, next) => {
    currentUser = null;
    res.render('login', {
        title: 'Quited',
        path:'/login',
        isLogin: false,
    }); 
    
}