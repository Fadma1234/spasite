var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
const MongoClient = require('mongodb').MongoClient  
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

var db

// configuration ===============================================================
mongoose.connect(configDB.url); // Connect to our database without the callback wrapper

require('./config/passport')(passport); // pass passport for configuration

// set up our express application (Middleware must come first!)
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'rcbootcamp2021b', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash()); 


// routes ======================================================================
// Load our routes definition file AFTER all middleware is initialized
// We need a slight change to how you pass 'db' here, as we get the db object later in Mongoose 5+
// A common approach is to make 'db' accessible globally or change how you connect.

// A standard way to manage this with newer Mongoose is often to pass the connection object itself.
// For now, let's assume your previous method of passing 'db' works once connected:

mongoose.connection.once('open', () => {
    console.log('Connected to Mongo via Mongoose');
    db = mongoose.connection.db;
    require('./app/routes.js')(app, passport, db);
});


// launch ======================================================================

app.listen(port);
console.log('The magic happens on port ' + port);