const mysql = require('mysql');

require('dotenv').config();

const db = mysql.createConnection({
    host: 'localhost',
    user:  'root',
    password: '',
    database: 'asikbanget'
})

db.connect ((err) => {
    if (err) throw err;
    console.log ('Database connected...');
});

module.exports = db;
