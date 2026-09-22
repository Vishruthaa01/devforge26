const Order = require('../../models/enterprise/Order');
const Customer = require('../../models/enterprise/Customer');
const Refund = require('../../models/enterprise/Refund');

exports.getSales = async (req, res) => {
  try {
    // Generate some aggregations for the demo dashboard
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalRefunds = await Refund.countDocuments();

    // Calculate total revenue from successful orders
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalCustomers,
        totalRefunds,
        totalRevenue,
        period: 'All Time',
        // Mocking timeseries for charts
        salesTrend: [
          { name: 'Mon', revenue: 4000 },
          { name: 'Tue', revenue: 3000 },
          { name: 'Wed', revenue: 2000 },
          { name: 'Thu', revenue: 2780 },
          { name: 'Fri', revenue: 1890 },
          { name: 'Sat', revenue: 2390 },
          { name: 'Sun', revenue: 3490 },
        ]
      },
      metadata: { source: 'Enterprise Analytics Engine' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
