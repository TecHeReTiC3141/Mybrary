const dotenv = require('dotenv');
dotenv.config();

const connection = require('../utils/getSequelizeInstance');
const { DataTypes } = require('sequelize');
const path = require('path');

const Book = require('../models/books');

const Genre = connection.define('genre', {
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
    icon: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

Genre.hasMany(Book);
Book.belongsTo(Genre);

module.exports = Genre;
