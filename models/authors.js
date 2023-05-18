const dotenv = require('dotenv');
dotenv.config();

const connection = require('../dbService');
const { DataTypes } = require('sequelize');
console.log(process.env.DATABASE, process.env.USER, process.env.PASSWORD);

const Author = connection.define('author', {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

Author.sync({ force: true }).then(() =>
    console.log("The table for the Author was just recreated!"));


module.exports = Author;
