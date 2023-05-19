const express = require('express');
const router = express.Router();
const Author = require('../models/authors');

// Get all authors
router.get('/', (req, res) => {
    res.render('authors/index');
});

// New authors form
router.get('/new', (req, res) => {
    res.render('authors/new');
});

router.post('/', async (req, res) => {

    try {
        let newAuthor = await Author.create({
            name: req.body.name,
            age: +req.body.age
        });
        console.log(newAuthor.toJSON());
        console.log('on new post');
        res.redirect('/authors'); // then to author profile page
        // res.redirect(`/authors/${newAuthor.id}`); // then to author profile page
    } catch (err) {
        console.log(`Error while creating new author: ${err.message}`);
        res.render('authors/new', {
            errorMessage: `Error while creating new author: ${err.message}`
        });
    }
 });

module.exports = router;