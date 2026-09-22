const { v4: uuidv4 } = require('uuid');
const Refund = require('../../models/enterprise/Refund');
const Payment = require('../../models/enterprise/Payment');
const Order = require('../../models/enterprise/Order');

exports.executeRefund = async (req, res) => {
  try {
    const { amount, customerId, paymentId } = req.body;
    
    // In a real system, we'd look up the payment to ensure it exists and matches
    // For demo purposes, we'll create a dummy orderId and paymentId if not provided
    const refPaymentId = paymentId || `PAY-${Math.floor(Math.random() * 10000)}`;
    const refOrderId = `ORD-${Math.floor(Math.random() * 10000)}`;

    const refund = await Refund.create({
      refundId: uuidv4(),
      paymentId: refPaymentId,
      orderId: refOrderId,
      customerId: customerId || 'UNKNOWN',
      amount,
      reason: 'Agent requested refund',
      status: 'PROCESSED',
      requestedBy: req.securityContext?.agent?.agentId || 'UNKNOWN_AGENT',
      processedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Refund successfully processed in Enterprise Finance System',
      data: refund,
      correlationId: `CORR-${Math.floor(Math.random() * 100000)}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
