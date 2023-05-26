const dotenv = require('dotenv');
dotenv.config();

const connection = require('../dbService');
const { DataTypes } = require('sequelize');
const path = require('path');

const Author = require('../models/authors');

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
    coverImage: {
        type: DataTypes.BLOB('long'),
        allowNull: false,
    },
    coverImageType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    coverImagePath: {
        type: DataTypes.VIRTUAL(DataTypes.STRING,
            ['coverImage', 'coverImageType']),
        get: function() {
            if (this.coverImage !== null && this.coverImageType !== null) {
                return `data:${this.coverImageType};charset=utf-8;base64,
                ${this.coverImage.toString('base64')}`
            }
        }
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


module.exports = Book;
