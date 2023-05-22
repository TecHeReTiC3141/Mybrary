const express = require('express');
const router = express.Router();
const Author = require('../models/authors');
const Book = require('../models/books');
const { Sequelize, Op } = require('sequelize');

// Get all books
router.get('/', async (req, res) => {
    res.render('books/index', { pattern: null, books: [] });
});

// New books form
router.get('/new', async (req, res) => {
    try {
        res.render('books/new', { book: {},
            authors: await Author.findAll(),
        });
    } catch (err) {
        console.log(err);
        res.redirect('/books');
    }

});

router.post('/', async (req, res) => {
    res.send('Book created');

});

module.exports = router;
