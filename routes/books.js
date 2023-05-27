const express = require('express');

const router = express.Router();
const Author = require('../models/authors');
const Book = require('../models/books');
const {Sequelize, Op} = require('sequelize');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif',]

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
router.get('/new', async (req, res) => {
    await createNewBookPage(
        {
            res,
            book: {}
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

        const err = await saveCover(book, req.body.cover);
        res.redirect('/books');
    } catch (err) {
        await createNewBookPage({
            res,
            book: {
                title: req.body.title,
                author: req.body.author,
                publishDate: new Date(req.body.publishDate),
                pageCount: req.body.pageCount,
                description: req.body.description,
            },
            error: err,
        })
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

async function createNewBookPage({res, book, error = null}) {
    try {
        const params = {
            authors: await Author.findAll(),
            book,
        }
        if (error) params.errorMessage =
            `Error while creating new book: ${error.message}`;
        res.render('books/new', params);
    } catch (err) {
        console.log(err);
        res.redirect('/books');
    }
}

module.exports = router;
