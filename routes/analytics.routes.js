const express = require('express');
const passport = require('passport');

const controller = require('../controllers/analytics.controller');
const router = express.Router();

router.get(
  '/overview',
  passport.authenticate('jwt', { session: false }),
  controller.overview
);
router.get(
  '/analytics',
  passport.authenticate('jwt', { session: false }),
  controller.analytics
);

module.exports = router;
