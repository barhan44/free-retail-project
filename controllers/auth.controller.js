const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User.model');
const configs = require('../config/configs');
const errorHandler = require('../utils/errorHandler');

module.exports.login = async function (req, res) {
  const user = await getUserByEmail(req.body.email);
  return user
    ? validatePassword(user, req.body.password, res)
    : res.status(404).json({
        message: 'User is not found! Try another email',
      });
};

module.exports.register = async function (req, res) {
  const isUserExists = await getUserByEmail(req.body.email);

  return !isUserExists
    ? createUser(req, res)
    : res.status(409).json({
        message: 'User already exists!',
      });
};

const createUser = async (req, res) => {
  const user = getNewUser(req.body);
  await saveNewUser(user, res);
};

const getHashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

const getNewUser = (credentials) => {
  return new User({
    email: credentials.email,
    password: getHashPassword(credentials.password),
  });
};

const saveNewUser = async (user, res) => {
  try {
    await user.save();
    res.status(201).json(user);
  } catch (e) {
    errorHandler(res, e);
  }
};

const getToken = (user, res) => {
  const token = jwt.sign({ email: user.email, userID: user._id }, configs.jwt, {
    expiresIn: 3600,
  });

  res.status(200).json({
    token: `Bearer ${token}`,
  });
};

const validatePassword = (user, password, res) => {
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  return isPasswordValid
    ? getToken(user, res)
    : res.status(401).json({
        message: 'Password is invalid, try again!',
      });
};

const getUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user ? user : null;
};
