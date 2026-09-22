const mongoose = require('mongoose');
require('dotenv').config();

const Customer = require('../models/enterprise/Customer');
const Order = require('../models/enterprise/Order');
const Payment = require('../models/enterprise/Payment');
const Refund = require('../models/enterprise/Refund');

const seedEnterpriseData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Enterprise Seeding');

    // Clear existing enterprise data
    await Customer.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});
    await Refund.deleteMany({});
    console.log('Enterprise Database cleared');

    // Seed 100 Customers
    const customers = [];
    for (let i = 1; i <= 100; i++) {
      customers.push({
        customerId: `C${1000 + i}`,
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        phone: `555-01${i.toString().padStart(2, '0')}`,
        status: i % 10 === 0 ? 'INACTIVE' : 'ACTIVE',
        customerType: i % 5 === 0 ? 'VIP' : 'REGULAR',
        totalOrders: Math.floor(Math.random() * 5) + 1,
        totalSpent: Math.floor(Math.random() * 5000) + 100
      });
    }
    await Customer.insertMany(customers);
    console.log('100 Customers seeded');

    // Seed 200 Orders & Payments
    const orders = [];
    const payments = [];
    let paymentCount = 1000;
    
    // Specifically make sure C1023 (mentioned in prompt) has some data
    const targetCustomer = await Customer.findOne({ customerId: 'C1023' });
    const c1023Id = targetCustomer ? targetCustomer._id : customers[22]._id; // fallback

    for (let i = 1; i <= 200; i++) {
      const dbCustomer = await Customer.findOne({ customerId: `C${1000 + Math.ceil(i/2)}` });
      if (!dbCustomer) continue;

      const orderAmount = Math.floor(Math.random() * 2000) + 50;
      
      const order = {
        orderId: `ORD-${2000 + i}`,
        customerId: dbCustomer._id,
        items: [{ name: `Product ${i % 10}`, quantity: 1, price: orderAmount }],
        subtotal: orderAmount,
        tax: orderAmount * 0.1,
        totalAmount: orderAmount * 1.1,
        paymentStatus: i % 15 === 0 ? 'FAILED' : 'PAID',
        orderStatus: 'DELIVERED'
      };
      const createdOrder = await Order.create(order);
      
      const payment = {
        paymentId: `PAY-${paymentCount++}`,
        customerId: dbCustomer._id,
        orderId: createdOrder._id,
        amount: orderAmount * 1.1,
        status: order.paymentStatus === 'PAID' ? 'SUCCESS' : 'FAILED',
        paymentMethod: i % 3 === 0 ? 'PAYPAL' : 'CREDIT_CARD'
      };
      await Payment.create(payment);
    }
    console.log('200 Orders and Payments seeded');

    console.log('Enterprise Seeding Complete!');
    process.exit(0);
  } catch (err) {
    console.error('Enterprise Seeding Error:', err);
    process.exit(1);
  }
};

seedEnterpriseData();
