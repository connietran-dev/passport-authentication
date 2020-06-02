// Requiring necessary npm packages
var express = require("express");

// express-session is session middleware for Express
var session = require("express-session");

// passport is Express-compatible authentication middleware for Node.js
// Requiring passport as we've configured it
var passport = require("./config/passport");

// Setting up port and requiring models for syncing
var PORT = process.env.PORT || 8080;
var db = require("./models");

// Creating express app and configuring middleware needed for authentication
var app = express();
// Allows Express to parse JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Tells Express to serve static files from the public/ folder
app.use(express.static("public"));

// We need to use sessions to keep track of our user's login status
// secret - Secret used to sign the session ID cookie
// resave - 
// saveUninitialized: true - Forces a session that is "uninitialized" to be saved to the store
app.use(session({ 
  secret: "keyboard cat", 
  resave: true, 
  saveUninitialized: true 
}));
app.use(passport.initialize());
app.use(passport.session());

// Requiring our routes
require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app);

// Syncing our database and logging a message to the user upon success
db.sequelize.sync().then(function() {
  app.listen(PORT, function() {
    console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
  });
});
