const connection = require('../utility/database');
const Blockchain = require('../public/javascripts/blockchain');

module.exports = class User {

  constructor(tc, name, surname, isVote = null, nonce = null, previous = null, hash = null) {
    this.tc = tc;
    this.name = name;
    this.surname = surname;
    this.isVote = isVote === null ? null : Boolean(isVote);
    this.nonce = nonce;
    this.previous = previous;
    this.hash = hash;
  }

  saveUser() {
    return connection.execute(
      'INSERT INTO users (tc, name, surname, isVote, nonce, previous, hash) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [this.tc, this.name, this.surname, this.isVote, this.nonce, this.previous, this.hash]
    );
  }

  static async getAll() {
    return connection.execute('SELECT * FROM users');
  }

  static async getByTC(tc) {
    return connection.execute('SELECT * FROM users WHERE tc = ?', [tc]);
  }

  static async updateIsVote(tc, isVote) {
    return connection.execute('UPDATE users SET isVote = ? WHERE tc = ?', [isVote, tc]);
  }

  static async getLastUser() {
    const [rows] = await connection.execute('SELECT * FROM users ORDER BY tc DESC LIMIT 1');
    return rows.length > 0 ? rows[0] : null;
  }

  static async updateUserHash(tc, hash, previous, nonce) {
    if (hash.length > 64 || previous.length > 64) {
      throw new Error('Hash or Previous data too long');
    }
    return connection.execute('UPDATE users SET hash = ?, previous = ?, nonce = ? WHERE tc = ?', [hash, previous, nonce, tc]);
  }

  static async hashUser(tc, name, surname, isVote, nonce, previous) {
    const { hash, nonce: newNonce } = await Blockchain.hashUser(tc, name, surname, isVote, nonce, previous);
    return hash;
  }

  static async updateUserChain() {
    const [users] = await this.getAll();
    let previous = "0000000000000000000000000000000000000000000000000000000000000000";

    for (const user of users) {
      const nonce = user.nonce;
      const hash = await this.hashUser(user.tc, user.name, user.surname, user.isVote, nonce, previous);
      console.log(`Updating user ${user.tc}: hash length ${hash.length}, previous length ${previous.length}`);
      await this.updateUserHash(user.tc, hash, previous, nonce);
      previous = hash;
    }
  }

// Yeni fonksiyon: Kullanıcı hashlerini doğrulama
static async verifyUserHashes() {
    const [users] = await this.getAll();
    const pattern = '0000f';  // Pattern kontrolü için
    for (const user of users) {
      if (user.hash !== null) {
        if (user.hash.substr(0, pattern.length) > pattern) {
          return false;  // Eğer hash pattern'e uymuyorsa false döner
        }
      }
    }
    return true;  // Tüm hashler pattern'e uyuyorsa true döner
  }

}