const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const Author = require('../models/authors');
const {Book, coverImageRootPath} = require('../models/books');
const {Sequelize, Op} = require('sequelize');

const uploadPath = path.join('public', coverImageRootPath);
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif',]

const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    }
})

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

router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file !== null && req.file !== undefined
        ? req.file.filename : null;
    let book = {};
    try {
        book = await Book.create({
            title: req.body.title,
            author: req.body.author,
            publishDate: new Date(req.body.publishDate),
            pageCount: req.body.pageCount,
            description: req.body.description,
            coverImageName: fileName,
        });
        res.redirect('/books');
    } catch (err) {
        if (fileName) {
            removeCoverFile(fileName);
        }
        await createNewBookPage({
            res,
            book: {
                title: req.body.title,
                author: req.body.author,
                publishDate: new Date(req.body.publishDate),
                pageCount: req.body.pageCount,
                description: req.body.description,
                coverImageName: fileName,
            },
            error: err,
        })
    }

});

function removeCoverFile(coverImageName) {
    fs.unlink(path.join(uploadPath, coverImageName), err => {
        if (err) console.error(err);
    });
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
