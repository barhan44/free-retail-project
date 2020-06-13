const express = require('express');
const controller = require('../controllers/position.controller');
const router = express.Router();

router.get('/:categoryID', controller.getByCategoryID);
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
