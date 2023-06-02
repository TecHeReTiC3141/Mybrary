const express = require('express');
const router = express.Router();

const Book  = require('../models/books');

router.get('/', async (req, res) => {
    let books;

    try {

        books = await Book.findAll({
            order: [
                ['createdAt', 'DESC'],
            ],
            limit: 5,
        });

    } catch (err) {
        console.log(err.message);
        books = [];
    }
    res.render('index', {books});
});

module.exports = router;