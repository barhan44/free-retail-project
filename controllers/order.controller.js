const Order = require('../models/Order.model');
const errorHandler = require('../utils/errorHandler');

module.exports.getAll = async function (req, res) {
  const query = buildGetAllQuery(req);
  try {
    const orders = await Order.find(query)
      .sort({ date: -1 })
      .skip(+req.query.offset)
      .limit(+req.query.limit);
    res.status(200).json(orders);
  } catch (e) {
    errorHandler(res, e);
  }
};

module.exports.create = async function (req, res) {
  try {
    const maxOrder = getMaxOrderNumber(await getLastOrder(req.user.id));
    const order = await new Order({
      list: req.body.list,
      user: req.user.id,
      order: maxOrder + 1,
    }).save();
    res.status(201).json(order);
  } catch (e) {
    errorHandler(res, e);
  }
};

const getLastOrder = (userID) => {
  return Order.findOne({ user: userID }).sort({
    date: -1,
  });
};

const getMaxOrderNumber = (order) => {
  return order ? order.order : 0;
};

const buildGetAllQuery = (req) => {
  const { start, end, order } = req.query;
  const query = {
    user: req.user.id,
  };

  if (start) {
    query.date = {
      $gte: start,
    };
  }

  if (end) {
    if (!query.date) {
      query.date = {};
    }
    query.date['$lte'] = end;
  }

  if (order) {
    query.order = +order;
  }

  return query;
};
