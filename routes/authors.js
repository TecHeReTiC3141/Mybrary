const express = require('express');
const router = express.Router();
const Author = require('../models/authors');
const { Sequelize, Op } = require('sequelize');

// Get all authors
router.get('/', async (req, res) => {
    try {
        let authors;
        if (req.query.pattern ) {
            let reg = req.query.pattern.toLowerCase();
            authors = await Author.findAll({
                attributes: ['name'],
                where: {
                    [Op.and]: [
                        Sequelize.where(
                            Sequelize.fn('lower', Sequelize.col('name')),
                            {
                                [Op.like]: `%${reg}%`
                            }
                        )
                    ]
                }
            });
        } else {
            authors = await Author.findAll();
        }

        res.render('authors/index', { authors,
            pattern: req.query.pattern });
    } catch (err) {
        console.log(err.message);
        res.redirect('/');
    }
});

// New authors form
router.get('/new', (req, res) => {
    res.render('authors/new', { author: {}});
});

router.post('/', async (req, res) => {

    try {
        let newAuthor = await Author.create({
            name: req.body.name,
            age: +req.body.age
        });
        console.log(newAuthor.toJSON());
        res.redirect('/authors'); // then to author profile page
        // res.redirect(`/authors/${newAuthor.id}`); // then to author profile page
    } catch (err) {
        console.log(`Error while creating new author: ${err.message}`);
        res.render('authors/new', {
            errorMessage: `Error while creating new author: ${err.message}`,
            author: {
                name: req.body.name,
                age: +req.body.age
            }
        });
    }
 });

module.exports = router;