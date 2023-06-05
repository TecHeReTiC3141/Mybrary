const express = require('express');
const router = express.Router();

const Book = require('../models/books');

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
    console.log(req.user);
    console.log(req.user.ID, req.user.email);
    res.render('index', {
        books, user: req.user,
        isAuthenticated: req.isAuthenticated(),
    });
});

module.exports = router;