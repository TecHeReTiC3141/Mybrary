const express = require('express');
const multer = require('multer');
const path = require('path');

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
    try {
        res.render('books/index',
            {pattern: null, books: await Book.findAll()});
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
    const fileName = req.file !== null ? req.file.filename : null;
    let book;
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
        await createNewBookPage({
            res,
            book,
            error: err,
        })
    }

});

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
