# Sequelize: Reverse Engineering Code

We were tasked with reverse engineering and providing a walkthrough of the codebase for a NodeJS authentication application that utilizes `Sequelize` and `Passport.js`. The following is a walkthrough of how the app functions and of each file's responsibility.

## App Functionality

This is a simple app in which you can sign up, log in, and log out. Whenever you: a) go to the root page `/`, b) go to the URL ending in `/login`, or c) go to the URL ending in `/members`, the application will check whether you already have an account. If you do, you will be taken to the `/members` page.

If you go to the homepage `/` and you are not already authenticated, the app will show you the Sign Up Form page (`/public/signup.html`). On the Sign Up Form, you can enter an email address and password to sign up. If you do not fill out any values, you will be given an error.

You can click 'Or log in here' link on the Sign Up Form or go directly to the URL ending in `/login`. If you do so, you will be taken to the Login Form where you can enter your email address and password to log in.

Once you have authenticated, you will see a simple page that displays `Welcome ${yourEmailAddress}`. You can also use this page to Logout.


## Code Tutorial

### **package.json**

#### Purpose: 

* The package.json documents metadata about the Node application, including dependencies that are needed for the application. 

* You can run `npm install` to install the following Node packages required for the application:
    * `bcryptjs` - password hashing function
    * `express` - web framework for Node
    *` express-session` - session middleware for Express
    * `mysql2` - MySQL driver used with Sequelize
    * `passport` - Express-compatible authentication middleware for Node.js
    * `passport-local` - Passport strategy for authenticating with a username and password
    * `sequelize` - ORM for Node.JS


### **server.js**

#### Purpose:
* This file requires Express to set up an Express server needed to run the application. 

* `process.env.PORT || 3000` means to run the application on whatever is in the environment variable PORT, f0r example, if you deploy to a server like Heroku, or `8080` if there's nothing there, for example if you run the application locally.

* When you initiate the server with `node server.js`, you can view the `index.html` in your browser. You can do this by running `node server.js`. Then go to your browser and go to `localhost:8080`.

* Before initiating your server, make sure to create the `passport_demo` database in your local development environment as specified in `config/config.json`. 

    * You can create this database by running the following in your database client (e.g., MySQL Workbench or Navicat) or by using the MySQL CLI:   
    
        ```
        DROP DATABASE IF EXISTS `passport_demo`;
        CREATE DATABASE `passport_demo`;
        ```


### **routes/html-routes.js**

#### Purpose:

* This file uses Express to define routes for common URL requests from the user's browser - for example, the `/` root, `/login`, and `/members`. Whenever there is a request for one of these routes from the browser, this file has code to check whether the user already has an account. If they do, they will be sent to the `/members` page. Otherwise, the app uses `.sendFile` to send the `/signup.html` or `/login.html` files for the `/` root and `/login` respectively. If a user who is not logged in tries to access the `/members` route, they will be redirected to the signup page


### **models/index.js**

#### Purpose:

* This is the default file created when the Sequelize CLI is run using `npx sequelize-cli init:models`. 
* This file reads the file system of the application with `fs`, interacts with Sequelize, and loads in the configuration of the environment created by package.json.
* This file creates an instance of Sequelize, passes in `config` as an object, and automatically creates a `model` out of any files in the same directory as this file that end in `.js`, such as `user.js`.
* This then loads those objects in memory, and exports these objects. This allows us to `require("./models")` in `server.js`.


## The Sign Up Process

* public/signup.html 
* public/js/signup.js 
* routes/api-routes.js 
* models/user.js
* config/config.json
* config/middleware/isAuthenticated.js

#### Purpose:

* Since you have likely not yet made an account and thus, are not authenticated, one of the first pages you see when you come to the site is the Sign Up Form. 

    * If you go to `http://localhost:8080/` after running `node server.js`, the `server.js` file will `.sendFile` the `signup.html` file which the browser renders as the Sign Up Form on the page.

* The **`signup.html`** file is a simple HTML form consisting of `<input>` for the user's email and password required to sign up.

* The **`signup.js`** file uses JQuery to program the behavior of the page on the client side, when the user submits the Sign Up Form.

    * When the user submits the Sign Up Form (`signUpForm.on("submit")`), the app checks `if (!userData.email || !userData.password)` to ensure neither email nor password fields are blank. If they are, the JQuery event is `return`ed early, and an error is shown to the user.

    * Otherwise, if there is an email and password populated, the `signUpUser` function is run, and the email and password input fields are set to blank if the `signUpUser` function is successfully run.

    * The `signUpUser` function uses JQuery to POST to the `/api/signup` route with the email and password entered.

* The `/api/signup` route is defined in the **`routes/api-routes.js`** file. The file requires the `../models` file and `../config/passport` file. 

    * When the `/api/signup` route receives a POST from the browser client, the email and password properties on the request body (`req.body`) are passed from the client and are used to create a new User using the User model from `models/user.js`.

* The **`models/user.js`** file requires the `bcrypt` package and utilizes `Sequelize` to define the data Model of a new User to interface with the database.

* The **`config/config.json`** file specifies configurations for connecting with the database that is created by Sequelize. The file indicates that the dialect and database that is created is MySQL. This file also indicates the credentials and metadata that should be used to connect to the database in each environment - development, test, and production.

    * When creating a new User, the Model in `user.js` indicates the email and password are strings and are required (`allowNull: false`). The email must be a unique and must be a valid email address. These validations are enforced by using the sequelize `DataTypes` and `validate` syntax.

    * This file also uses what is called a Hooks in Sequelize (also known as lifecycle events), that are functions which are called before and after calls in sequelize are executed. In this file, we use the following method: 
    
        ```
        User.addHook("beforeCreate"), function(user) {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
        });
        ```

    * `User.addHook` uses `bcrypt` to hash the password from the user before storing it in the `passport_demo` database created by Sequelize as indicated in `config.json`. `bcrypt.genSaltSync(10)` specifies how many times to generate the hash and, thus, how secure the password will be. 10 is a fairly common value that will allow the hashing to be quick yet secure.

    * Note that `.hashSync` hashes the password synchronously.

    * In addition, the Model also defines a custom method on the User model, called `validPassword` that is used to validate the password later on. `validPassword` compares the incoming `password` with `this.password` which is the hashed password property on the User model object.

* If creating the User is successful in `api-routes.js`, `.then` the response uses a 307 to temporarily redirect the user to `/api/login`. With a 307, the method and the body of the original request are reused to perform the redirected request. Thus, the user is automatically logged in. Otherwise, a 401 Unauthorized Error is sent to the client.

* Back on the client side in `signup.js`, if the POST is successful, `.then`, `window.location.replace("/members")` occurs which is a method off of the Location interface which replaces the current `signup.html` resource with the one at the provided URL, which is `/members`.

    * The `/members` route is defined in `html-routes.js`. This route checks if the user `isAuthenticated` by `require("../config/middleware/isAuthenticated")`. 

* In the **`isAuthenticated.js`** file, a function is exported to check if the user is logged in. If so, the app will continue with the request to the restricted route. If the user isn't logged in, the app will redirect them to the login page. 

    * In the above case, because we are using a 307 temporary redirect, the original request is reused, which allows the user to be automatically logged in.