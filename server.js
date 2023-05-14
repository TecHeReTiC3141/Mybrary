const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const expressLayouts = require('express-ejs-layouts');
const indexRouter = require('./routes/index');
const authorsRouter = require('./routes/authors');
const dbService = require('./dbService');


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
app.use('/', indexRouter);
app.use('/authors', authorsRouter);

app.listen(process.env.PORT || 3000,
    () => console.log('On http://localhost:3000'));