const connection = require('../utility/database');

module.exports = class User {

    constructor(tc, name, surname) {
        this.tc = tc;
        this.name = name;
        this.surname = surname;
    }

    saveUser() {
        return connection.execute('INSERT INTO users (tc, name, surname) VALUES (?, ?, ?)', [this.tc, this.name, this.surname]);
    }

    static getAll() {
        return connection.execute('SELECT * FROM users');
    }

    static getByTC(tc) {
        return connection.execute('SELECT * FROM users WHERE tc=?', [tc]);
    }

}