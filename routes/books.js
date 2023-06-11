const express = require('express');

const router = express.Router();
const Author = require('../models/authors');
const Genre = require('../models/genre');
const Book = require('../models/books');
const Mark = require('../models/mark');

const {Sequelize, Op} = require('sequelize');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif',];

const {checkAuthentication, checkNotAuthentication} = require('../utils/middleware');

// Get all books
router.get('/', async (req, res) => {
    // Creating search query
    const where = {
        [Op.and]: []
    };
    const order = [];
    let symbols = Object.getOwnPropertySymbols(where);


    if (req.query.title) {
        const reg = req.query.title.toLowerCase();
        where[symbols[0]].push(
            Sequelize.where(
                Sequelize.fn('lower', Sequelize.col('title')),
                {
                    [Op.like]: `%${reg}%`
                }
            )
        )
    }
    if (req.query.publishedAfter) {
        where[symbols[0]].push({
                publishDate: {
                    [Op.gte]: req.query.publishedAfter,
                }
            }
        )
    }
    if (req.query.publishedBefore) {
        where[symbols[0]].push({
                publishDate: {
                    [Op.lte]: req.query.publishedBefore,
                }
            }
        )
    }

    if (req.query.sortByRating) {
        order.push(['rating', 'DESC']);
    }

    try {
        let searchOptions = {
            title: req.query.title,
            publishedAfter: req.query.publishedAfter,
            publishedBefore: req.query.publishedBefore,
        }
        const books = await Book.findAll({
            where,
            order,
        });
        res.render('books/index',
            {
                searchOptions,
                books,
                entriesCol: books.length,

            });
    } catch (err) {
        res.render('index', {
            errorMessage: err.message,
        });
    }
});

// New books form
router.get('/new', checkAuthentication, async (req, res) => {
    await CreateBookFormPage(
        {
            res,
            book: {},
            form: 'new',
        });

});

router.post('/', async (req, res) => {
    let book = {};
    try {
        book = await Book.build({
            title: req.body.title,
            authorID: req.body.author,
            publishDate: new Date(req.body.publishDate),
            pageCount: req.body.pageCount,
            description: req.body.description,
        });

        await saveCover(book, req.body.cover);
        res.redirect('/books');
    } catch (err) {
        await CreateBookFormPage(
            {
                res,
                book: {
                    title: req.body.title,
                    author: req.body.author,
                    publishDate: new Date(req.body.publishDate),
                    pageCount: req.body.pageCount,
                    description: req.body.description,
                },
                form: 'new',
            });
    }

});

router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findOne({
            where: {
                ID: req.params.id,
            },
        });
        await CreateBookFormPage(
            {
                res,
                book: book,
                form: 'edit',
            });
    } catch (err) {
        res.redirect('/books')
    }
})

router.route('/:id')
    .get(async (req, res) => {
        try {
            const book = await Book.findOne({
                where: {
                    ID: req.params.id,
                },
                include: Author
            });
            if (book === null) {
                req.flash("messages", {'error': 'No such book'});
                res.redirect('/books');
            } else {
                let mark = null;
                if (req.isAuthenticated()) {
                    mark = await Mark.findOne({
                        where: {
                            [Op.and]: [
                                {AuthorId: req.user.ID,},
                                {BookId: req.params.id,},
                            ],
                        }
                    })
                }
                const {sum: rating_sum, count: rating_col } = await getBookMarks(req.params.id);
                res.render('books/show', {book, mark: mark?.mark, rating_col, rating_sum });
            }

        } catch (err) {
            res.redirect('/books');
        }
    })
    .put(async (req, res) => {
        try {
            const book = await Book.findOne({
                where: {
                    ID: req.params.id,
                }
            });
            if (book === null) {
                req.flash("messages", {'error': 'No such book'});
                res.redirect('/books');
            } else {
                await book.update(req.body);
                await book.save();
                await saveCover(book, req.body.cover);
                res.redirect(`/books/${req.params.id}`);
            }

        } catch (err) {
            const book = req.body;
            book.publishDate = new Date(book.publishDate);

            res.redirect(`/books/${req.params.id}/edit`);

        }
    })
    .delete(async (req, res) => {
        let book;
        try {
            book = await Book.findOne({
                where: {
                    ID: req.params.id,
                }
            });
            await book.destroy();

            res.redirect('/books/');
        } catch (err) {
            if (book !== null) {
                res.render('books/show', {
                    book,
                    errorMessage: `Could not remove book: ${err.message}`,
                })
            } else {
                res.redirect('/books');
            }
        }
    });

router.post('/:id/mark', checkAuthentication, async (req, res) => {
    let mark;
    try {
        mark = await Mark.findOne({
            where: {
                BookId: req.params.id,
                AuthorId: req.user.ID,
            },

        });
        if (mark === null) {
            mark = await Mark.create({
                BookId: req.params.id,
                AuthorId: req.user.ID,
                mark: req.body.rating,
            });
        } else {
            mark.update({
                mark: req.body.rating,
            })
        }
        const {sum: rating_sum, count: rating_col } = await getBookMarks(req.params.id);
        const book = await Book.findOne({
            where: {
                ID: req.params.id,
            }
        });
        book.update({
            rating: rating_sum / rating_col,
        })

        res.redirect(`/books/${req.params.id}`);
    } catch (err) {
        console.log(err);
        res.redirect(`/books/${req.params.id}`);
    }
});

async function saveCover(book, coverEncoded) {
    if (!coverEncoded) return;
    const cover = JSON.parse(coverEncoded);
    if (cover !== null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
        await book.save();
    }
}

async function CreateBookFormPage({res, book, form, error = null}) {
    try {
        const params = {
            authors: await Author.findAll(),
            book,
        }
        if (error) params.errorMessage =
            `Error while creating new book: ${error.message}`;
        res.render(`books/${form}`, params);
    } catch (err) {
        res.redirect('/books');
    }
}

async function getBookMarks(bookId) {
    return {
        'count': await Mark.count({
            where: {
                BookId: bookId,
            }
        }),
        'sum': await Mark.sum('mark', {
            where: {
                BookId: bookId,
            }
        }),
    };
}

module.exports = router;
