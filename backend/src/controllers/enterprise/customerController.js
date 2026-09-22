const Customer = require('../../models/enterprise/Customer');
const Order = require('../../models/enterprise/Order');
const Payment = require('../../models/enterprise/Payment');

exports.getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findOne({ customerId: id });
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    // Include recent orders and payments for a rich response
    const orders = await Order.find({ customerId: id }).sort({ createdAt: -1 }).limit(5);
    const payments = await Payment.find({ customerId: id }).sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        profile: customer,
        recentOrders: orders,
        recentPayments: payments
      },
      metadata: { source: 'Enterprise Customer Service', securityContext: req.securityContext?.actionRequested }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const customer = await Customer.findOneAndUpdate(
      { customerId: id },
      { $set: updateData },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
