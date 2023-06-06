const express = require('express');

const router = express.Router();
const Author = require('../models/authors');
const Book = require('../models/books');
const {Sequelize, Op} = require('sequelize');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif',];

const { checkAuthentication, checkNotAuthentication } = require('../utils/middleware');


// Get all books
router.get('/', async (req, res) => {
    // Creating search query
    const where = {
        [Op.and]: []
    };
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

    try {
        let searchOptions = {
            title: req.query.title,
            publishedAfter: req.query.publishedAfter,
            publishedBefore: req.query.publishedBefore,
        }
        const books = await Book.findAll({
            where
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
                const books = await Book.findAll();
                req.flash('error',  'No such book');
                res.redirect('/books');

            } else {
                res.render('books/show', {book});
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
                req.flash('error',  'No such book');
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
    })

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

module.exports = router;
