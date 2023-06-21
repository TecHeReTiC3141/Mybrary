const dotenv = require('dotenv');
dotenv.config();
const { Sequelize } = require('sequelize');

let sequelize;

function initialize() {
    if (!sequelize) {
        sequelize = new Sequelize(process.env.DATABASE,
            process.env.USER, process.env.PASSWORD,
            {
                dialect: 'mysql',
                host: process.env.HOST,
                logging: false,
            }
        );
    }
    return sequelize;

}

module.exports = initialize();
