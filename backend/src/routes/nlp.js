const express = require('express');
const router = express.Router();

// A simple deterministic NLP intent parser for hackathon purposes
const parseIntent = (text) => {
  const lowerText = text.toLowerCase();
  
  // 1. REFUND Intent
  if (lowerText.includes('refund')) {
    // Extract amount
    let amount = 0;
    const amountMatch = lowerText.match(/(?:₹|\$)?(\d+(?:,\d+)?)/);
    if (amountMatch) {
      amount = parseInt(amountMatch[1].replace(',', ''), 10);
    }
    
    // Extract customer ID (Assuming format C followed by numbers)
    let customerId = 'UNKNOWN';
    const customerMatch = text.match(/C\d+/i);
    if (customerMatch) {
      customerId = customerMatch[0].toUpperCase();
    }

    return {
      action: 'EXECUTE_REFUND',
      method: 'POST',
      path: '/api/enterprise/finance/refund',
      payload: { amount, customerId }
    };
  }

  // 2. UPDATE CUSTOMER Intent
  if (lowerText.includes('update') && lowerText.includes('customer')) {
    let customerId = 'C1000';
    const customerMatch = text.match(/C\d+/i);
    if (customerMatch) {
      customerId = customerMatch[0].toUpperCase();
    }
    
    // Check if updating phone
    let payload = {};
    if (lowerText.includes('phone')) {
      const phoneMatch = text.match(/phone.*?(to|is)?\s*([\d-]+)/i);
      if (phoneMatch && phoneMatch[2]) {
        payload.phone = phoneMatch[2];
      } else {
        payload.phone = 'UPDATED_PHONE';
      }
    }

    return {
      action: 'UPDATE_CUSTOMER',
      method: 'PUT',
      path: `/api/enterprise/customers/${customerId}`,
      payload
    };
  }

  // 3. FETCH CUSTOMER Intent
  if ((lowerText.includes('find') || lowerText.includes('get') || lowerText.includes('fetch')) && lowerText.includes('customer')) {
    let customerId = 'C1000';
    const customerMatch = text.match(/C\d+/i);
    if (customerMatch) {
      customerId = customerMatch[0].toUpperCase();
    }

    return {
      action: 'READ_CUSTOMER',
      method: 'GET',
      path: `/api/enterprise/customers/${customerId}`,
      payload: {}
    };
  }

  // 4. VIEW SALES Intent
  if ((lowerText.includes('show') || lowerText.includes('view') || lowerText.includes('get')) && lowerText.includes('sales')) {
    return {
      action: 'READ_SALES',
      method: 'GET',
      path: '/api/enterprise/sales',
      payload: {}
    };
  }

  // 5. EXPORT CUSTOMERS Intent
  if (lowerText.includes('export') && lowerText.includes('customer')) {
    return {
      action: 'EXPORT_CUSTOMERS',
      method: 'GET', // or POST
      path: '/api/enterprise/customers/export',
      payload: {}
    };
  }
  
  // 6. DELETE CUSTOMER Intent
  if (lowerText.includes('delete') && lowerText.includes('customer')) {
    let customerId = 'C1000';
    const customerMatch = text.match(/C\d+/i);
    if (customerMatch) {
      customerId = customerMatch[0].toUpperCase();
    }
    return {
      action: 'DELETE_CUSTOMER',
      method: 'DELETE',
      path: `/api/enterprise/customers/${customerId}`,
      payload: {}
    };
  }

  // Fallback
  return {
    action: 'UNKNOWN',
    method: 'GET',
    path: '/api/unknown',
    payload: {},
    error: "I'm sorry, I couldn't understand that request."
  };
};

router.post('/parse-intent', (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ success: false, error: 'Missing text input' });
  }

  const intent = parseIntent(text);
  res.json({ success: true, data: intent });
});

module.exports = router;
