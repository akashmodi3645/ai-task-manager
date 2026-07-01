import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { createServer } from 'http';

import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { checkOverdueTasks } from './services/notificationService.js';
import teamRoutes from './routes/teamRoutes.js'
import meetingRoutes from './routes/meetingRoutes.js';
import { initSocket } from './socket.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://192.168.1.5:5173',  // 🔥 Replace with YOUR IP
    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/  // Allow any 192.168.x.x
  ],
  credentials: true
}));


// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 1000, // 1000 requests instead of 100
//   message: 'Too many requests, please try again later.'
// });
// app.use('/api/', limiter);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api', meetingRoutes);


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Cron job for overdue task checks (runs every hour)
cron.schedule('0 * * * *', () => {
  checkOverdueTasks();
});

// Error handler
app.use(errorHandler);

// Wrap Express in a raw HTTP server so Socket.io can share the same port
const server = createServer(app);
initSocket(server);

server.listen(PORT, '0.0.0.0', () => {  // 🔥 Listen on all network interfaces
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📱 Local: http://localhost:${PORT}`);
  console.log(`📱 Network: http://192.168.1.4:${PORT}`);
  console.log(`💬 Socket.io ready for real-time chat`);
});
