const routes = require('express').Router()


// routes.use('/api/v1', require('../controllers/AdminController'));
routes.use('/api/v1/users', require('../controllers/UserController'));

module.exports = routes;