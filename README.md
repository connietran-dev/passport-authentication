# Sequelize: Reverse Engineering Code

We were tasked with reverse engineering providing a walkthrough of the codebase for a NodeJS application that utilizes `Sequelize` and `Passport.js`. The following is a walkthrough of each file's responsibility and of how the app functions.

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
* When you initiate the server, you can view the `index.html` in your browser. You can do this by running `node server.js`. Then go to your browser and go to `localhost:8080`