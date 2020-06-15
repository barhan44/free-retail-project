const express = require('express');
const controller = require('../controllers/order.controller');
const router = express.Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  controller.getAll
);
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  controller.create
);

module.exports = router;
