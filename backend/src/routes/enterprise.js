const express = require('express');
const router = express.Router();

const customerController = require('../controllers/enterprise/customerController');
const financeController = require('../controllers/enterprise/financeController');
const analyticsController = require('../controllers/enterprise/analyticsController');

// Ensure the request came through the Security Gateway (Service-to-Service Auth check concept)
// In a real app we'd check a signed JWT added by the Gateway. Here we verify `req.securityContext` exists.
router.use((req, res, next) => {
  if (!req.securityContext) {
    return res.status(401).json({ 
      success: false, 
      error: 'Direct Enterprise API access forbidden. All requests must pass through the Security Gateway.' 
    });
  }
  next();
});

// Customer Routes
router.get('/customers/:id', customerController.getCustomer);
router.put('/customers/:id', customerController.updateCustomer);

// Legacy route from early phase matching simulator
router.get('/customers', (req, res) => {
  res.json({ success: true, message: 'Customer List Fetched' });
});

// Finance / Refund Routes
router.post('/finance/refund', financeController.executeRefund);

// Analytics / Sales Routes
router.get('/sales', analyticsController.getSales);

module.exports = router;
