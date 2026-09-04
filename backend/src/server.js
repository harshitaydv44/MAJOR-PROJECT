const http = require('http');
const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const { connectDB } = require('./config/db');
const { initSocket } = require('./services/socketService');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const sanitizeMiddleware = require('./middleware/sanitizeMiddleware');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Middleware
app.use(
  cors({
    origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(sanitizeMiddleware);

// Root informational endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    portal: 'Delhi Societal Innovation & Collaboration Portal',
    version: '1.0.0',
    status: 'operational',
    documentation: '/docs',
    healthCheck: '/api/health'
  });
});

// API Routes
app.use('/api', apiRoutes);

// Centralized error handling
app.use(errorHandler);

// Connect to Database & Start Server
const startServer = async () => {
  await connectDB();

  server.listen(config.port, () => {
    console.log('====================================================');
    console.log(`[Delhi Portal API] Running on port ${config.port}`);
    console.log(`[Environment] ${config.nodeEnv}`);
    console.log(`[Health Endpoint] http://localhost:${config.port}/api/health`);
    console.log('====================================================');
  });
};

startServer();

module.exports = { app, server };
