const express = require('express');
const router = express.Router();
const Book = require('../models/books');
const { Sequelize, Op } = require('sequelize');

// Get all books
router.get('/', async (req, res) => {
    res.send('All books');
});

// New books form
router.get('/new', (req, res) => {
    res.send('New books');

});

router.post('/', async (req, res) => {
    res.send('Book created');

});

module.exports = router;
