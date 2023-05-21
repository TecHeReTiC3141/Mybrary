const express = require('express');
const router = express.Router();
const Book = require('../models/books');
const { Sequelize, Op } = require('sequelize');

// Get all books
router.get('/', async (req, res) => {

});

// New books form
router.get('/new', (req, res) => {

});

router.post('/', async (req, res) => {

 });

module.exports = router;