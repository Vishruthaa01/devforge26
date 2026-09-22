const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const Agent = require('../models/Agent');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');
const EnterpriseAPI = require('../models/EnterpriseAPI');
const Endpoint = require('../models/Endpoint');
const Policy = require('../models/Policy');
const SecurityAlert = require('../models/SecurityAlert');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding');

    // Clear DB
    await Agent.deleteMany({});
    await Role.deleteMany({});
    await AuditLog.deleteMany({});
    await EnterpriseAPI.deleteMany({});
    await Endpoint.deleteMany({});
    await Policy.deleteMany({});
    await SecurityAlert.deleteMany({});
    console.log('Database cleared');

    // 1. Roles
    await Role.create([
      { name: 'CustomerSupport', description: 'Handles customer queries and updates', allowedActions: ['READ_CUSTOMER', 'UPDATE_CUSTOMER', 'READ_SALES'] },
      { name: 'FinancialAuditor', description: 'Handles finance and refund operations', allowedActions: ['READ_SALES', 'READ_CUSTOMER', 'EXECUTE_REFUND'] },
      { name: 'Sales', description: 'Sales operations', allowedActions: ['READ_CUSTOMER', 'CREATE_LEAD', 'UPDATE_LEAD', 'VIEW_SALES', 'EXPORT_SALES'] },
      { name: 'HR', description: 'HR operations', allowedActions: ['READ_EMPLOYEE', 'UPDATE_EMPLOYEE', 'VIEW_ATTENDANCE', 'VIEW_SALARY'] },
      { name: 'IT_Support', description: 'IT helpdesk', allowedActions: ['READ_USER', 'RESET_PASSWORD', 'CREATE_TICKET', 'CLOSE_TICKET'] },
      { name: 'Procurement', description: 'Procurement operations', allowedActions: ['VIEW_INVENTORY', 'CREATE_PURCHASE_ORDER', 'APPROVE_PURCHASE'] },
      { name: 'Analytics', description: 'Data analytics', allowedActions: ['VIEW_REPORT', 'VIEW_SALES', 'EXPORT_REPORT'] },
      { name: 'Admin', description: 'System administrators', allowedActions: ['*'] }
    ]);
    console.log('Roles seeded');

    // 2. Agents
    await Agent.create([
      {
        agentId: 'CustomerBot',
        name: 'Customer Service Bot',
        description: 'First line customer support AI',
        department: 'Support',
        role: 'CustomerSupport',
        token: 'mock-jwt-customer-bot',
        allowedApis: ['CustomerAPI', 'SalesAPI']
      },
      {
        agentId: 'FinanceBot',
        name: 'Financial Auditor Bot',
        description: 'AI for handling refunds and audits',
        department: 'Finance',
        role: 'FinancialAuditor',
        token: 'mock-jwt-finance-bot',
        allowedApis: ['CustomerAPI', 'FinanceAPI', 'SalesAPI']
      },
      {
        agentId: 'SalesBot',
        name: 'Sales Assistant Bot',
        description: 'AI for lead management',
        department: 'Sales',
        role: 'Sales',
        token: 'mock-jwt-sales-bot',
        allowedApis: ['SalesAPI']
      },
      {
        agentId: 'AnalyticsBot',
        name: 'Data Analytics Bot',
        description: 'AI for aggregating enterprise data',
        department: 'Data',
        role: 'Analytics',
        token: 'mock-jwt-analytics-bot',
        allowedApis: ['CustomerAPI', 'SalesAPI', 'FinanceAPI']
      }
    ]);
    console.log('Agents seeded');

    // 3. Enterprise APIs
    const customerApi = await EnterpriseAPI.create({
      apiId: 'CustomerAPI',
      name: 'Customer Management API',
      description: 'API for accessing and mutating customer data',
      baseUrl: '/api/enterprise/customers',
      department: 'Support',
      sensitivity: 'CONFIDENTIAL',
      riskLevel: 'MEDIUM'
    });

    const salesApi = await EnterpriseAPI.create({
      apiId: 'SalesAPI',
      name: 'Sales Reporting API',
      description: 'API for fetching sales reports',
      baseUrl: '/api/enterprise/sales',
      department: 'Sales',
      sensitivity: 'INTERNAL',
      riskLevel: 'LOW'
    });

    const financeApi = await EnterpriseAPI.create({
      apiId: 'FinanceAPI',
      name: 'Finance & Payments API',
      description: 'API for handling sensitive financial transactions',
      baseUrl: '/api/enterprise/finance',
      department: 'Finance',
      sensitivity: 'RESTRICTED',
      riskLevel: 'HIGH'
    });
    console.log('Enterprise APIs seeded');

    // 4. Endpoints
    await Endpoint.create([
      {
        endpointId: uuidv4(),
        apiId: customerApi.apiId,
        method: 'GET',
        path: '/api/enterprise/customers',
        action: 'READ_CUSTOMER',
        description: 'Fetch customer records',
        sensitivity: 'INTERNAL',
        riskLevel: 'LOW'
      },
      {
        endpointId: uuidv4(),
        apiId: customerApi.apiId,
        method: 'PUT',
        path: '/api/enterprise/customers/:id', // Note: Express route pattern
        action: 'UPDATE_CUSTOMER',
        description: 'Update a specific customer record',
        sensitivity: 'CONFIDENTIAL',
        riskLevel: 'MEDIUM'
      },
      {
        endpointId: uuidv4(),
        apiId: salesApi.apiId,
        method: 'GET',
        path: '/api/enterprise/sales',
        action: 'READ_SALES',
        description: 'View sales data',
        sensitivity: 'INTERNAL',
        riskLevel: 'LOW'
      },
      {
        endpointId: uuidv4(),
        apiId: financeApi.apiId,
        method: 'POST',
        path: '/api/enterprise/finance/refund',
        action: 'EXECUTE_REFUND',
        description: 'Execute a refund to a customer',
        sensitivity: 'RESTRICTED',
        riskLevel: 'HIGH',
        approvalRequired: 'CONDITIONAL'
      }
    ]);
    console.log('Endpoints seeded');

    // 5. Policies
    await Policy.create([
      {
        policyId: uuidv4(),
        name: 'Block Analytics Data Export',
        description: 'Analytics Bot cannot export customer PII',
        conditions: [
          { field: 'agent.role', operator: 'equals', value: 'Analytics' },
          { field: 'action', operator: 'equals', value: 'EXPORT_CUSTOMERS' }
        ],
        effect: 'BLOCK',
        priority: 10
      },
      {
        policyId: uuidv4(),
        name: 'Delete Customer Approval',
        description: 'Deleting a customer always requires human approval',
        conditions: [
          { field: 'action', operator: 'equals', value: 'DELETE_CUSTOMER' }
        ],
        effect: 'APPROVAL',
        priority: 20
      }
    ]);
    console.log('Policies seeded');

    console.log('Seeding Complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seedDB();
