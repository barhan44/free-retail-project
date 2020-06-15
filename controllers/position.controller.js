const Position = require('../models/Position.model');
const errorHandler = require('../utils/errorHandler');

module.exports.getByCategoryID = async function (req, res) {
  try {
    const positions = await Position.find({
      category: req.params.categoryID,
      user: req.user.id,
    });
    res.status(200).json(positions);
  } catch (e) {
    errorHandler(res, e);
  }
};

module.exports.create = async function (req, res) {
  const { name, cost, category } = req.body;
  try {
    const position = await new Position({
      name,
      cost,
      category,
      user: req.user.id,
    }).save();
    res.status(201).json(position);
  } catch (e) {
    errorHandler(res, e);
  }
};

module.exports.remove = async function (req, res) {
  try {
    await Position.remove({
      _id: req.params.id,
    });
    res.status(200).json({ message: 'The position has been deleted' });
  } catch (e) {
    errorHandler(res, e);
  }
};

module.exports.update = async function (req, res) {
  try {
    const position = await Position.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(position);
  } catch (e) {
    errorHandler(res, e);
  }
};
