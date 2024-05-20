const connection = require('../utility/database');

module.exports = class Block {

    constructor(vote) {
        this.nonce = 0;
        this.previous = "0";
        this.hash = "0";
        this.vote = vote;
        this.id = null; // id'yi burada tanımlıyoruz, ancak henüz değeri yok

        this._countPromise = new Promise((resolve, reject) => {
            Block.count()
                .then(count => {
                    this.id = count[0][0].total_blocks + 1;
                    resolve(); // count() işlemi tamamlandı, diğer işlemler şimdi gerçekleştirilebilir
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    // Dışarıdan erişilebilir bir method oluşturuyoruz
    countCompleted() {
        return this._countPromise;
    }
    
    saveBlock() {
        return connection.execute('INSERT INTO blocks (id, nonce, previous, hash, vote) VALUES (?, ?, ?, ?, ?)', [this.id, this.nonce, this.previous, this.hash, this.vote]);
    }

    static getAll() {
        return connection.execute('SELECT * FROM blocks');
    }

    static count() {
        return connection.execute('SELECT COUNT(*) AS total_blocks FROM blocks');
    }

    static getVoteCount(voteValue) {
        return connection.execute('SELECT COUNT(*) AS count FROM blocks WHERE vote = ?', [voteValue]);
    }    

    static getById(id) {
        return connection.execute('SELECT * FROM blocks WHERE block.id=?', [id]);
    }

    static Update(block) {
        return connection.execute('UPDATE blocks SET blocks.nonce=?,blocks.previous=?,blocks.hash=?,blocks.vote=? WHERE blocks.id=?', [block.nonce, block.previous, block.hash, block.vote, block.id]);
    }

    static UpdateAll(blocks) {
        blocks.forEach(block => {
            Block.Update(block);
        });
    }

    static DeleteById(id) {
        return connection.execute('DELETE FROM blocks WHERE id=?', [id]);
    }

}

