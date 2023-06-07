const dotenv = require('dotenv');
dotenv.config();

const connection = require('../utils/getSequelizeInstance');

const Book = require('./books');
const Author = require('./authors');
const {DataTypes} = require("sequelize");

const Marks = connection.define('Marks', {
    AuthorId: {
        type: DataTypes.INTEGER,
        references: {
            model: Author,
            key: 'ID',
        }
    },
    BookId: {
        type: DataTypes.INTEGER,
        references: {
            model: Book,
            key: 'ID',
        }
    },
    mark: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
});

Book.belongsToMany(Author, { through: Marks });
Author.belongsToMany(Book, { through: Marks });

module.exports = Marks;