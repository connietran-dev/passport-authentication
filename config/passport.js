var passport = require("passport");
// .Strategy gets the local Strategy from passport-local
var LocalStrategy = require("passport-local").Strategy;

var db = require("../models");

// Telling passport we want to .use a Local Strategy. In other words, we want login with a username/email and password
passport.use(new LocalStrategy(
  // usernameField defines the name of the username field as "email"
  // Our user will sign in using an email, rather than a "username"
  // You can pass in the password
  // But we don't need to specify the password because it's already default password in our application
  {
    usernameField: "email"
  },
  // Next is a function to authenticate our user
  // This is essentially the function that will be called from our login when we want to check whether the user and password are correct 
  // This function takes in the email which is the usernameField, password, and a done function
  function (email, password, done) {
    // When a user tries to sign in this code runs
    // This uses the Sequelize method from the User object defined in user.js
    // to search for a single instance WHERE email matches the email passed
    db.User.findOne({
      where: {
        email: email
      }
    }).then(function (dbUser) {
      // If there's no user with the given email, we return
      if (!dbUser) {
        // done is the function we call every time we're done
        return done(null, false, {
          message: "Incorrect email."
        });
      }
      // If there is a user with the given email, but the password the user gives us is incorrect
      // Note we use the .validPassword method off of the User Model
      else if (!dbUser.validPassword(password)) {

        return done(null, false, {
          message: "Incorrect password."
        });
      }
      // If none of the above, return the user
      return done(null, dbUser);
    });
  }
));

// In order to help keep authentication state across HTTP requests,
// Sequelize needs to serialize the user to store inside of the session and deserialize the user 
// Just consider this part boilerplate needed to make it all work
passport.serializeUser(function (user, cb) {
  // null is the error
  // Otherwise, the user is pass into our done function to save the user in the session
  cb(null, user);
});

// Here we are passing the User object
passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

// Exporting our configured passport
module.exports = passport;
