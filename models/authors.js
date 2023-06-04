const dotenv = require('dotenv');
dotenv.config();

const connection = require('../dbService');
const { DataTypes } = require('sequelize');

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
        validate: {
            len: [2, 50],
        },
        trim: true,

    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    biography: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

    age: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
});
//
// Author.sync({ force: true }).then(() =>
//     console.log("The table for the Author was just recreated!"));


module.exports = Author;
