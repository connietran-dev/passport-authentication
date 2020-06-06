# Sequelize & Passport.js: Reverse Engineering Code

We were tasked with reverse engineering and providing a walkthrough of the codebase for a NodeJS authentication application that utilizes `Sequelize` and `Passport.js`. The following is a walkthrough of how the app functions and of each file's responsibility. 

Throughout the code, I have added comments. These comments center especially around the following new technologies that have been introduced:

* bcrypt
* Passport.js
* express-session

As you read through this README, you may find it helpful to pull up the code alongside its description. You can also download the repo, run `npm install` to install dependencies and `npm start` to run the application on http://localhost:8080/ in your browser. I have also added a script so you can run `npm run watch` so the server will refresh automatically if you make changes to the files.

## App Functionality

This is a simple app in which you can sign up, log in, and log out. Whenever you: a) go to the root page `"/"`, b) go to the URL ending in `/login`, or c) go to the URL ending in `/members`, the application will check whether you already have an account. If you do, you will be taken to the `/members` page.

If you go to the homepage `"/"` and you are not already authenticated, the app will show you the Sign Up Form page (`/public/signup.html`). On the Sign Up Form, you can enter an email address and password to sign up. If you do not fill out any values, you will be given an error.

You can click 'Or log in here' link on the Sign Up Form or go directly to the URL ending in `/login`. If you do so, you will be taken to the Login Form where you can enter your email address and password to log in.

Once you have authenticated, you will see a simple page that displays `Welcome ${yourEmailAddress}`. You can also use this page to Logout.


# Code Walkthrough

## General Application Files

### **package.json**

#### Purpose: 

* The package.json documents metadata about the Node application, including dependencies that are needed for the application. 

* You can run `npm install` to install the following Node packages required for the application:
    * `bcryptjs` - password hashing function
    * `express` - web framework for Node
    * `express-session` - session middleware for Express
    * `passport` - Express-compatible authentication middleware for Node.js
    * `passport-local` - Passport strategy for authenticating with a local username and password instead of something like authenticating with Google
    * `sequelize` - ORM for Node.JS
    * `mysql2` - MySQL driver used with Sequelize


### **server.js**

#### Purpose:

* This file requires Express to set up an Express server needed to run the application. 

* `process.env.PORT || 8080` means the application will run on whatever is in the environment variable PORT, for example, for when you deploy to a server like Heroku; OR it will run on 8080 if there's nothing there, for example, if you run the application locally.

* When you initiate the server with `node server.js`, you can view the application in your browser. You can do this by running `node server.js`, then go to your browser and go to `localhost:8080`.


### **config/config.json**

#### Purpose:

* Before initiating your server, make sure to create the `passport_demo` database in your local development environment as specified in `config/config.json`.

* Note that in `config.json` the `"dialect"` specified for Sequelize is `"mysql"`. Thus, the database created must be a MySQL database.

* You can create the `passport_demo` database locally by running the following in your database client (e.g., MySQL Workbench or Navicat) or by using the MySQL CLI:   

    ```
    DROP DATABASE IF EXISTS `passport_demo`;
    CREATE DATABASE `passport_demo`;
    ```

* Depending on which environment you are running the application, use the applicable credentials in `config.json` to allow the application access to your database.


### **routes/html-routes.js**

#### Purpose:

* This file uses Express to define routes for common URL requests from the user's browser - for example, the `"/"` root, `/login`, and `/members`. Whenever there is a request for one of these routes from the browser, this file has code to check whether the user already has an account. 

* If the user has an account, they will be sent to the `/members` page. Otherwise, the app uses `.sendFile` to send the `/signup.html` or `/login.html` files for the `"/"` root and `/login` routes, respectively. 

* If a user who is not logged in tries to access the `/members` route, they will be redirected to the signup page.


### **models/index.js**

#### Purpose:

* This is the default file created when the Sequelize CLI (command-line inteface) is run using `npx sequelize-cli init:models` command. 

* This `models/index.js`file reads the file system of the application with `fs`, interacts with Sequelize, and loads in the configuration of the environment created by package.json.

* This file creates an instance of Sequelize, passes in `config` as an object.

* The main purpose of this file is to automatically create a `model` out of any files in the same directory as this file that end in `.js`, such as `user.js`. A Model represents a table in the database, e.g., `Users` table in our `passport_demo` database which is created out of `user.js`. Instances of this class, e.g., a `db.User.create` in `api-routes.js` represent a database row.

* This file then loads these objects in memory and exports these objects. This allows us to import all models in the `models/` folder into `server.js` with `require("./models")`.



## The Sign Up Process

With the general application files laid out, let's track what happens when a user signs up for an account in the browser and walk through the following files:

* public/signup.html 
* public/js/signup.js 
* routes/html-routes.js 
* routes/api-routes.js 
* models/user.js
* bcryptjs
* config/config.json
* config/middleware/isAuthenticated.js

#### Purpose:

* Since you have likely not yet made an account and thus, are not authenticated, one of the first pages you see when you come to the site is the Sign Up Form. 

* If you go to `http://localhost:8080/` after running `node server.js`, the **`routes/html-routes.js`** file will `.sendFile` the `signup.html` file which the browser renders as the Sign Up Form in the browser.

* The **`signup.html`** file is a simple HTML form consisting of `<input>` for the user's email and password required to sign up.

* The **`signup.js`** file uses JQuery to program the behavior of the Sign Up page on the client side, when the user submits the Sign Up Form.

    * When the user submits the Sign Up Form (`signUpForm.on("submit")`), the app checks `if (!userData.email || !userData.password)` to ensure neither email nor password fields are blank. If they are, the JQuery event is `return`ed early, and an error is shown to the user.

    * Otherwise, if there is an email and password populated, the `signUpUser` function is run, and the email and password input fields are set to blank if the `signUpUser` function is successfully run.

* The `signUpUser` function uses JQuery to POST to the `/api/signup` route with the email and password entered.

* The `/api/signup` route is defined in the **`routes/api-routes.js`** file. The file requires the `../models` file and `../config/passport` file. 

    * When the `/api/signup` route receives a POST from the client (the browser), the email and password properties on the request body (`req.body`) are passed from the client and are used to create a new User using the User model from `models/user.js`.

* The **`models/user.js`** file requires the **`bcryptjs`** package and utilizes `Sequelize` to define the data Model of a new User that will be created in the `passport_demo` database.

* The **`config/config.json`** file specifies configurations for connecting with the database that is created by Sequelize. The file indicates that the dialect and database that is created in MySQL. This `config.json` file also indicates the credentials and metadata that should be used to connect to the database in each environment - development, test, and production.

* When creating a new User, the Model in `models/user.js` indicates the email and password are strings and are required (`allowNull: false`). The email must be a unique and must be a valid email address. These validations are enforced by using the Sequelize `DataTypes` and `validate` syntax.

    * This file also uses what are called Hooks in Sequelize (also known as lifecycle events). Hooks are functions that can be called before and after calls in Squelize are executed. In this `models/user.js` file, we use the following method: 
    
        ```
        User.addHook("beforeCreate"), function(user) {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
        });
        ```

    * `User.addHook` uses `bcrypt` to hash the password from the user before storing it in the `passport_demo` database using `.addHook("beforeCreate")`. 
    
    * `bcrypt.genSaltSync(10)` specifies how many times to generate the hash and, thus, how secure the password will be. 10 is a fairly common value that will allow the hashing to be quick yet secure. Note that `.hashSync` hashes the password synchronously.

    * In addition, the User Model also defines a custom method on the User model, called `validPassword` that is used to validate the password later on. `validPassword` compares the incoming `password` with `this.password` - the hashed password on the User model object.

* If creating the User is successful in `api-routes.js`, `.then` the response uses a 307 to temporarily redirect the user to `/api/login`. With a 307, the method and the body of the original request are reused to perform the redirected request. The request in `/api/login` is `passport.authenticate` (explained in detail below). Thus, the user is automatically logged in. Otherwise, a 401 Unauthorized Error is sent to the client.

* Back on the client side in `signup.js`, if the POST is successful, `.then`, `window.location.replace("/members")` occurs which is a method off of the Location interface which replaces the current `signup.html` resource with the one at the provided URL - `/members`.

    * The `/members` route is also defined in `html-routes.js`. This route checks if the user `isAuthenticated` by using the file imported by `require("../config/middleware/isAuthenticated")`. 

* In the **`isAuthenticated.js`** file, a single function is exported and its only purpose is to check if the user is logged in.

    * This function is only called on the `/members` route. If the user is logged in, the app will continue with the request to the current `/members` route and continue to an anonymous function which `res.sendFile` the `members.html`. If the user isn't logged in, the app will redirect them to the `"/"`, which is the login page as defined in `html-routes.js`. 

    * In the above case, because we are using a 307 temporary redirect from the `/signup` to `/member` route, the email and password in body of the original `signup` request is reused, which allows the user to be automatically logged in.


## The Log In Process

* public/login.html 
* public/js/login.js 
* routes/api-routes.js
* config/middleware/isAuthenticated.js
* server.js
* models/user.js
* config/passport.js

### Purpose:

* When you enter your credentials on the **`public/login.html`** page and click Login, then on submit (`loginForm.on("submit")`), the **`public/js/login.js`** file sends a POST to the `/api/login` route in `api-routes.js`.

* To authenticate in, the `/api/login` route in `api-routes.js` uses `passport.authenticate("local")` to authenticate the request. 

* In an Express-based application such as this, `passport.initialize()` middleware is required to initialize Passport which is used for authentication.([Source](http://www.passportjs.org/docs/authenticate/))  This is declared in **`server.js`**. 

 * If `passport.authenticate` is successful, then the server sends back `res.json(req.user)` with the user's information from the request in `api-routes.js`.

* Back on the client side in `login.js`, the window is replaced with the `/members` route with `window.location.replace("/members")`.

* If your application uses persistent login sessions, `passport.session()` middleware must also be used. ([Source](http://www.passportjs.org/docs/authenticate/)) This is also declared in **`server.js`** for the application.


### Passport.js Authentication

* Passport uses what are termed strategies to authenticate requests. Strategies range from verifying a username and password, delegated authentication using OAuth or federated authentication using OpenID.

    Before asking Passport to authenticate a request, the strategy (or strategies) used by an application must be configured. ([Source](http://www.passportjs.org/docs/authenticate/))

* This application the `"local"` strategy which asks the user for their username (email address) and password instead of authenticating with something like Google.

* Passport.js is configured by setting up **`config/passport.js`**. In this configuration, we tell Passport we want to `passport.use(new LocalStrategy`), a Local Strategy, by using `require("passport-local").Strategy`.

* In this `new LocalStrategy`, we define the `usernameField` to be the email so that email is required to sign in rather than username.

    * We also define an anonymous function on this `new LocalStrategy` to run when the user tries to sign in. This function authenticates the user by using Sequelize to find a user `WHERE` the email matches. If it is correct, we return the user and continue with the request for the `api/login` route.

    * In addition: Strategies require what is known as a verify callback. The purpose of a verify callback is to find the user that possesses a set of credentials. 
    
        When Passport authenticates a request, it parses the credentials contained in the request. It then invokes the verify callback with those credentials as arguments, in this case username and password. If the credentials are valid, the verify callback invokes `done` to supply Passport with the user that authenticated: 
        
        `return done(null, user);`.

        If the credentials are not valid (for example, if the password is incorrect), `done` should be invoked with `false` instead of a `user` to indicate an authentication failure.

        `return done(null, false);`

        An additional info message can be supplied to indicate the reason for the failure. This is useful for displaying a flash message prompting the user to try again.

        `return done(null, false, { message: 'Incorrect password.' });`

        (Source: http://www.passportjs.org/docs/authenticate/)

## User Sessions with `express-session`

* HTTP is stateless; in order to associate a request to any other request, you need a way to store user data between HTTP requests. Cookies and URL parameters [so, not sessions] are both suitable ways to transport data between the client and the server. But they are both readable and on the client side. ([Source](https://www.tutorialspoint.com/expressjs/expressjs_sessions.htm#:~:text=ExpressJS%20%2D%20Sessions,and%20on%20the%20client%20side))

* Sessions solve exactly this problem. You assign the client (the browser) an ID and it makes all further requests using that ID. Information associated with the client is stored on the server linked to this ID. ([Source](https://www.tutorialspoint.com/expressjs/expressjs_sessions.htm#:~:text=ExpressJS%20%2D%20Sessions,and%20on%20the%20client%20side))

* Thus, we use `express-session` in this application to achieve sessions. This `express-session` middleware handles all things for us:

    * Creating the session,
    * Setting the session cookie, and
    * Creating the session object in `req` object. 

* Whenever we make a request from the same client again, we will have their session information stored with us (given that the server was not restarted). ([Source](https://www.tutorialspoint.com/expressjs/expressjs_sessions.htm#:~:text=ExpressJS%20%2D%20Sessions,and%20on%20the%20client%20side))

* Note that enabling session support with Passport is entirely optional, though it is recommended for most applications. (Source: http://www.passportjs.org/docs/authenticate/)

* We need to use sessions to keep track of our user's login status. After successful authentication, Passport will establish a persistent login session. This is useful for the common scenario of users accessing a web application via a browser ([Source](http://www.passportjs.org/docs/authenticate/)). This is enabled in our application in **`server.js`** with:

    ```
    app.use(session({ 
    secret: "keyboard cat", 
    resave: true, 
    saveUninitialized: true 
    }));
    ```

* In a typical web application, the credentials used to authenticate a user will only be transmitted during the login request. If authentication succeeds, a session will be established and maintained via a cookie set in the user's browser.

    Each subsequent request will not contain credentials, but rather the unique cookie that identifies the session. In order to support login sessions, Passport will serialize and deserialize user instances to and from the session. ([Source](http://www.passportjs.org/docs/authenticate/))

* In the `passport.js` file, `passport.serializeUser` and `passport.deserializeUser` are used to specify the user data that will be stored inside the session.

    * Specifically, `serializeUser` is called on the login request. If the login is successful, then it decides what user information should get stored in the session and a cookie is sent to the browser for the same to maintain the session. ([Source](https://stackoverflow.com/questions/28691215/when-is-the-serialize-and-deserialize-passport-method-called-what-does-it-exact)). 
    
    * In `passport.js`, this serialization is achieved as follows:

        ```
        passport.serializeUser(function (user, cb) {
        // null is the error
        // Otherwise, the user is passed into our done function to save the user in the session
        cb(null, user);
        });
        ```

    * In this example [above], only the user ID is serialized to the session, keeping the amount of data stored within the session small. When subsequent requests are received, this ID is used to find the user, which will be restored to `req.user`. ([Source](http://www.passportjs.org/docs/authenticate/))

* When the login operation completes, `user` will be assigned to `req.user`. 

* This `req.user` is later used in each route in `html-routes.js` to check if the user has been authenticated. If so, they are redirected to /members with `res.redirect("/members")`:

    ```
    app.get("/", function(req, res) {
        // If the user already has an account send them to the members page
        if (req.user) {
        res.redirect("/members");
        }
        // Otherwise, send signup.html
        res.sendFile(path.join(__dirname, "../public/signup.html"));
    });
    ```


### Improvements to the Login Process:

* In the response from `app.post("/api/login")`, the `req.user` is returned, sending back the hashed password to the client. Although the window refreshes with `window.location.replace("/members")` in `signup.js`, sensitive data, such as the password, should not be sent to the client. 

* Express comes with a built-in session store called `MemoryStore`. This is the default when you don’t specify one explicitly as happens (actually, doesn't happen) in `server.js`. However, using MemoryStore in RAM will leak memory under most conditions, does not scale past a single process, and is meant for debugging and developing. Instead, in production, session data can be stored in a database or encrypted cookie storage. More information on how you can do this with a Redis backend can be found in the article [here](https://medium.com/mtholla/managing-node-js-express-sessions-with-redis-94cd099d6f2f). You can also use the NPM package, `express-mysql-session`.

* There is potential to also protect API endpoints in the application by also using Passport.js. Here is an example from [Passport.js](http://www.passportjs.org/docs/basic-digest/):
    ```
    app.get('/api/me',
    passport.authenticate('basic', { session: false }),
    function(req, res) {
        res.json(req.user);
    });
    ```