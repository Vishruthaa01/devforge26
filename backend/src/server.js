require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For development
    methods: ['GET', 'POST']
  }
});

// Pass io to req object so routes/middleware can use it
app.use((req, res, next) => {
  req.io = io;
  next();
});

const securityGateway = require('./middleware/securityGateway');
const enterpriseRoutes = require('./routes/enterprise');
const adminRoutes = require('./routes/admin');
const nlpRoutes = require('./routes/nlp');
const AuditLog = require('./models/AuditLog');

// Socket.io Connection
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Gateway is running' });
});

app.use('/api/admin', adminRoutes);
app.use('/api/nlp', nlpRoutes);

app.get('/api/audit-logs', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 });
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

app.use('/api/enterprise', securityGateway, enterpriseRoutes);

// Root route for the backend API
app.get('/', (req, res) => {
  res.json({ status: 'Security Gateway API is running in the cloud!' });
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected successfully');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Security Gateway Server running on port ${PORT}`);
});
