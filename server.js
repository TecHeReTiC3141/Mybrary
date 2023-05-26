const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');

const indexRouter = require('./routes/index');
const authorsRouter = require('./routes/authors');
const booksRouter = require('./routes/books');

const sequelize = require('./dbService');

sequelize.sync()
    .then(() => console.log("All models were synchronized successfully."));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb",
    extended: true, parameterLimit: 50000 }))
app.use(expressLayouts);
app.use(express.static('public'));
app.use(methodOverride('_method'));

app.use('/', indexRouter);
app.use('/authors', authorsRouter);
app.use('/books', booksRouter);

app.listen(process.env.PORT || 3000,
    () => console.log('On http://localhost:3000'));
