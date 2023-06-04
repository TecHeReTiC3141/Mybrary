const express = require('express');
const router = express.Router();
const Author = require('../models/authors');
const Book = require('../models/books');
const bcrypt = require('bcrypt');

const {Sequelize, Op} = require('sequelize');

// Get all authors
router.get('/', async (req, res) => {
    try {
        let authors;
        if (req.query.pattern) {
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

        res.render('authors/index', {
            authors,
            pattern: req.query.pattern
        });
    } catch (err) {
        console.log(err.message);
        res.redirect('/');
    }
});

router.get('/login', (req, res) => {
    res.render('authors/login');
});

router.post('/login', (req, res) => {
    res.render('authors/login');
});

router.get('/register', (req, res) => {
    res.render('authors/register', { author: {}});
})

router.post('/register', (req, res) => {
    res.render('authors/register');
})

// New authors form
router.get('/new', (req, res) => {
    res.render('authors/new', {author: {}});
});

router.post('/', async (req, res) => {
    try {
        let newAuthor = await Author.create({
            name: req.body.name,
            age: +req.body.age
        });
        console.log(newAuthor.toJSON());
        res.redirect(`/authors/${newAuthor.ID}`);
    } catch (err) {
        res.render('authors/new', {
            errorMessage: `Error while creating new author: ${err.message}`,
            author: {
                name: req.body.name,
                age: +req.body.age
            }
        });
    }
});

router.route('/:id')
    .get(async (req, res) => {
        try {
            const author = await Author.findOne({
                where: {
                    id: req.params.id,
                }
            });
            if (author === null) {
                res.redirect('/authors');
            } else {

                res.render('authors/profile', { author,
                    books: await getAuthorBooks(author) });
            }
        } catch (err) {
            res.redirect('/authors');
        }
    })
    .put(async (req, res) => {
        try {
            const author = await Author.findOne({
                where: {
                    ID: req.params.id,
                }
            });
            if (author === null) {
                res.redirect('/authors');
            } else {
                await author.update(req.body);
                await author.save();
                res.redirect(`/authors/${req.params.id}`);
            }

        } catch (err) {

            res.render(`authors/${req.params.id}/edit`, {
                errorMessage: `Error while editing new author: ${err.message}`,
                author: {
                    name: req.body.name,
                    age: +req.body.age
                }
            });
            res.redirect('/authors');
        }

    })
    .delete(async (req, res) => {
        let author;
        try {
            author = await Author.findOne({
                where: {
                    ID: req.params.id,
                }
            });
            if (author !== null) {
                const books = await getAuthorBooks(author);
                if (books.length) {
                    res.render('authors/index', {
                        authors: await Author.findAll(),
                        pattern: req.query.pattern,
                        errorMessage: 'Can not delete author with books',
                    });
                } else {
                    await author.destroy();
                }
            }
            res.redirect('/authors/');
        } catch (err) {
            res.redirect('/authors');
        }
    });

router.get('/:id/edit', async (req, res) => {
    const author = await Author.findOne({
        where: {
            ID: req.params.id,
        }
    });
    res.render('authors/edit', {author});
});

async function getAuthorBooks(author) {
    try {
        const books = await Book.findAll({
            attributes: ['title', 'coverImagePath'],
            where: {
                authorID: author.ID,
            }
        });
        return books;
    } catch (err) {
        return [];
    }
}

module.exports = router;
