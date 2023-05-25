const dotenv = require('dotenv');
dotenv.config();

const connection = require('../dbService');
const { DataTypes } = require('sequelize');

const Author = require('../models/authors');

const coverImageRootPath = 'uploads/bookCovers';

const Book = connection.define('book', {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 50],
        },
        trim: true,

    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    publishDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    pageCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    coverImageName: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

Author.hasMany(Book, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Book.belongsTo(Author);

//
// Book.sync().then(() =>
//     console.log("The table for the Book was just recreated!"));


module.exports = { Book, coverImageRootPath };
