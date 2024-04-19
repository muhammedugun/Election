const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'nodedb',
    password: 'Ugun.261'
});

module.exports = connection.promise();
