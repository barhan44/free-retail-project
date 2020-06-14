const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');

const User = mongoose.model('users');

const configs = require('../config/configs');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: configs.jwt,
};

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(options, async (payload, done) => {
      try {
        const user = await User.findById(payload.userID).select('email id');
        user ? done(null, user) : done(null, false);
      } catch (e) {
        console.error(e);
      }
    })
  );
};
