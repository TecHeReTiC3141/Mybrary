const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');

const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const flash = require('express-flash');
const passport = require('passport');

const indexRouter = require('./routes/index');
const authorsRouter = require('./routes/authors');
const booksRouter = require('./routes/books');

const sequelize = require('./utils/getSequelizeInstance');

require('./models/session');

sequelize.authenticate()
    .then(() => console.log('Connected successfully'))
    .catch(err => console.log(`Error while connecting: ${err.message}`));


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
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
    },
    store: new SequelizeStore({
        db: sequelize,
        table: 'Session',
    }),
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){
    res.locals.user = req.user;
    res.locals.isAuthenticated = req.isAuthenticated();

    next();
})

app.use('/', indexRouter);
app.use('/authors', authorsRouter);
app.use('/books', booksRouter);

app.listen(process.env.PORT || 3000,
    () => console.log('On http://localhost:3000'));

