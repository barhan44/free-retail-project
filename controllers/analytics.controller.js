const moment = require('moment');

const Order = require('../models/Order.model');
const errorHandler = require('../utils/errorHandler');

module.exports.overview = async function (req, res) {
  try {
    const allOrders = await Order.find({ user: req.user.id }).sort({ date: 1 });
    const ordersMap = getOrdersMap(allOrders);
    const prevDayOrders =
      ordersMap[moment().add(-1, 'd').format('DD.MM.YYYY')] || [];

    const prevDayOrdersNumber = prevDayOrders.length;
    const totalOrders = allOrders.length;
    const daysNumber = Object.keys(ordersMap).length;
    const totalOrdersPerDay = (totalOrders / daysNumber).toFixed(0);
    const ordersPercent = (
      (prevDayOrdersNumber / totalOrdersPerDay - 1) *
      100
    ).toFixed(2);
    const totalGain = calcPrice(allOrders);
    const dailyGain = totalGain / daysNumber;
    const prevDayGain = calcPrice(prevDayOrders);
    const gainPercent = ((prevDayGain / dailyGain - 1) * 100).toFixed(2);
    const compareGain = (prevDayGain - dailyGain).toFixed(2);
    const compareOrders = (prevDayOrdersNumber - totalOrdersPerDay).toFixed(2);

    res.status(200).json({
      gain: {
        percent: Math.abs(+gainPercent),
        compare: Math.abs(+compareGain),
        prevDay: +prevDayGain,
        isHigher: gainPercent > 0,
      },
      orders: {
        percent: Math.abs(+ordersPercent),
        compare: Math.abs(+compareOrders),
        prevDay: +prevDayOrdersNumber,
        isHigher: ordersPercent > 0,
      },
    });
  } catch (e) {
    errorHandler(res, e);
  }
};

module.exports.analytics = async function (req, res) {
  try {
    const allOrders = await Order.find({ user: req.user.id }).sort({ date: 1 });
    const ordersMap = getOrdersMap(allOrders);

    const average = +(
      calcPrice(allOrders) / Object.keys(ordersMap).length
    ).toFixed(2);

    const chart = Object.keys(ordersMap).map((label) => {
      const gain = calcPrice(ordersMap[label]);
      const order = ordersMap[label].length;
      return {
        label,
        order,
        gain,
      };
    });

    res.status(200).json({
      average,
      chart,
    });
  } catch (e) {
    errorHandler(res, e);
  }
};

function getOrdersMap(orders = []) {
  const daysOrders = {};
  orders.forEach((order) => {
    const date = moment(order.date).format('DD.MM.YYYY');
    if (date === moment().format('DD.MM.YYYY')) {
      return;
    }
    if (!daysOrders[date]) {
      daysOrders[date] = [];
    }

    daysOrders[date].push(order);
  });
  return daysOrders;
}

function calcPrice(orders = []) {
  return orders.reduce((total, order) => {
    const orderPrice = order.list.reduce((orderTotal, item) => {
      return (orderTotal += item.cost * item.quantity);
    }, 0);
    return (total += orderPrice);
  }, 0);
}
