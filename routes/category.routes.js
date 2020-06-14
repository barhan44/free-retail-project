const express = require('express');
const passport = require('passport');

const controller = require('../controllers/category.controller');
const router = express.Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  controller.getAll
);
router.get('/:id', controller.getByID);
router.delete('/:id', controller.remove);
router.post('/', controller.create);
router.patch('/:id', controller.update);

module.exports = router;
