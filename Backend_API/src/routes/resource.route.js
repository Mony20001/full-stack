const express = require('express');
const crud = require('../controllers/crud.controller');

module.exports = (name) => {
    const router = express.Router();
    router.route('/').get(crud.list(name)).post(crud.create(name));
    router.route('/:id').get(crud.get(name)).patch(crud.update(name)).delete(crud.remove(name));
    return router;
};
