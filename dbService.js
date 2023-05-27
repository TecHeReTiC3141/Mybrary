const dotenv = require('dotenv');
dotenv.config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASSWORD,
    {
        dialect: 'mysql',
        host: 'localhost',
    }
);

sequelize.authenticate()
    .then(() => console.log('Connected successfully'))
    .catch(err => console.log(`Error while connecting: ${err.message}`));

module.exports = sequelize;
