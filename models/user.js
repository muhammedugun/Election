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
    console.log("pre: " +previous);
    if (hash.length > 64 || previous.length > 64) {
      throw new Error('Hash or Previous data too long');
    }
    return connection.execute('UPDATE users SET hash = ?, previous = ?, nonce = ? WHERE tc = ?', [hash, previous, nonce, tc]);
  }

  static async hashUser(tc, name, surname, isVote, nonce, previous) {
    const { hash, nonce: newNonce } = await Blockchain.hashUser(tc, name, surname, isVote, nonce, previous);
    return { hash, nonce: newNonce };
  }

  static async hashUserNoPattern(tc, name, surname, isVote, nonce, previous) {
    const { hash } = await Blockchain.hashUserNoPattern(tc, name, surname, isVote, nonce, previous);
    return { hash };
  }

  static async updateUserChain() {
    const [users] = await this.getAll();

    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (user.tc === 1) {
            user.previous = "0000000000000000000000000000000000000000000000000000000000000000";
        } else {
            const previousUser = users[i - 1];
            if (previousUser) {
                user.previous = await this.hashUser(previousUser.tc, previousUser.name, previousUser.surname, previousUser.isVote, previousUser.nonce, previousUser.previous);
            } else {
                // İlk kullanıcı için varsayılan bir önceki hash değeri
                user.previous = "0000000000000000000000000000000000000000000000000000000000000000";
            }
        }
        console.log("before user.js -> updateUserChain -> user: " + user.tc + " nonce: " + user.nonce);
        const hash = await this.hashUser(user.tc, user.name, user.surname, user.isVote, user.nonce, user.previous);
        console.log("after user.js -> updateUserChain -> user: " + user.tc + " nonce: " + user.nonce);
        await this.updateUserHash(user.tc, hash, user.previous, user.nonce);
    }
}

// Yeni fonksiyon: Kullanıcı hashlerini doğrulama
static async verifyUserHashes() {
    const [users] = await this.getAll();
    const pattern = '0000f';  // Pattern kontrolü için
    for (const user of users) {
      if (user.hash !== null) {
        const result = await this.hashUserNoPattern(user.tc, user.name, user.surname, user.isVote, user.nonce, user.previous);
        console.log("user.js -> verifyUserHashes -> result: " + result);
        const tempHash = result;  // tempHash'in undefined olup olmadığını kontrol et
        if (tempHash === undefined) {
          throw new Error(`Hash computation failed for user ${user.tc}`);
        }
        if (tempHash.substr(0, pattern.length) > pattern) {
          return false;  // Eğer hash pattern'e uymuyorsa false döner
        }
      }
    }
    return true;  // Tüm hashler pattern'e uyuyorsa true döner
  }

}