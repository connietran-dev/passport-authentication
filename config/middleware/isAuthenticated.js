// This is a middleware function that takes in the request and response and restricts routes a user is not allowed to visit if not logged in
// This is used in api-routes.js to check whether the user is authenticated
// next is the function that is run after the check is finished
module.exports = function(req, res, next) {
  // If the user is logged in (returns true), continue with next and continue with the request in api-routes.js to the restricted route
  if (req.user) {
    return next();
  }

  // If the user isn't logged in, redirect them to the login page
  return res.redirect("/");
};
