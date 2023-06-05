const express = require('express');
const router = express.Router();
const Author = require('../models/authors');
const Book = require('../models/books');
const bcrypt = require('bcrypt');

const passport = require('passport');
const initialize = require('../utils/initiatePassport');

(async () => {
    await initialize(passport,
        async email => (await Author.findOne({
            where: {
                email,
            }
        })).toJSON(),
        async id => (await Author.findOne({
            where: {
                id,
            }
        })).toJSON(),
    );
})();

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
            pattern: req.query.pattern,
            user: req.user,
            isAuthenticated: req.isAuthenticated(),
        });
    } catch (err) {
        console.log(err.message);
        res.redirect('/');
    }
});

router.get('/login', checkNotAuthentication, (req, res) => {
    res.render('authors/login', {
        author: {},
        user: null, isAuthenticated: false
    });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: './login',
    failureFlash: true,
}));

router.get('/register', checkNotAuthentication, (req, res) => {
    res.render('authors/register', {author: {}});
})

router.post('/register', async (req, res) => {
    try {
        const author = await Author.create({
            name: req.body.name,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 10),
            biography: req.body.biography,
            age: req.body.age,
        });
        res.redirect('./login');
    } catch (err) {
        res.render('authors/register', {
            author: {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                biography: req.body.biography,
                age: req.body.age,
            }
        })
    }
})

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

                res.render('authors/profile', {
                    author,
                    books: await getAuthorBooks(author)
                });
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

function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('authors/login');
}

function checkNotAuthentication(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

module.exports = router;
