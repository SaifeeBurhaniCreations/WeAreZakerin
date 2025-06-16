const routes = require('express').Router()


// routes.use('/api/v1', require('../controllers/AdminController'));
routes.use('/api/v1/users', require('../controllers/UserController'));
routes.use('/api/v1/group', require('../controllers/GroupController'));

module.exports = routes;