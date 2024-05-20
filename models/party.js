const connection = require('../utility/database');

module.exports = class Party {

    constructor(id, name, imageURL) {
        this.id = id;
        this.name = name;
        this.imageURL = imageURL;
    }

    saveUser() {
        return connection.execute('INSERT INTO parties (id, name, imageURL) VALUES (?, ?, ?)', [this.id, this.name, this.imageURL]);
    }

    static getAll() {
        return connection.execute('SELECT * FROM parties');
    }

    static getByTC(tc) {
        return connection.execute('SELECT * FROM parties WHERE id=?', [id]);
    }

}

