const express = require('express');
const router = express.Router();

// Get all authors
router.get('/', (req, res) => {
    res.render('authors/index');
});

// New authors form
router.get('/new', (req, res) => {
    res.render('authors/new');
});

router.post('/', (req, res) => {
    res.send('Create author');
});

module.exports = router;