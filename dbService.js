const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    host: process.env.HOST,
});

connection.connect(err => {
    if (err) console.log(err.message);
    else {
        console.log(`db successfully connected`);
    }
});

class DbService {

    connection = connection;
    static instance = null;

    static getInstance() {
        return (this.instance ? this.instance : this.instance = new DbService());
    }
}


module.exports = DbService;
