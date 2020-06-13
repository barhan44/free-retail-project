module.exports.login = function (req, res) {
  res.status(200).json({
    login: req.body,
  });
};

module.exports.register = function (req, res) {
  res.status(200).json({
    register: 'register',
  });
};
