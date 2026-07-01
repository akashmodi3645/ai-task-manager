import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Team from './models/Team.js';
import Message from './models/Message.js';

// Confirm a user belongs to a team before letting them join its chat room
const isTeamMember = (team, userId) => {
  const uid = userId.toString();
  return (
    team.owner.toString() === uid ||
    team.members.some((m) => m.user.toString() === uid)
  );
};

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://ai-task-manager-ivory.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST']
  }
});

  // Authenticate every socket connection using the same JWT used for REST calls
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.user.name);

    // Join a team's chat room
    socket.on('join-team', async (teamId) => {
      try {
        const team = await Team.findById(teamId);
        if (!team || !isTeamMember(team, socket.user._id)) {
          socket.emit('chat-error', 'Not authorized to join this team chat');
          return;
        }
        socket.join(`team-${teamId}`);
        console.log(`👥 ${socket.user.name} joined chat room team-${teamId}`);
      } catch (err) {
        socket.emit('chat-error', 'Failed to join team chat');
      }
    });

    socket.on('leave-team', (teamId) => {
      socket.leave(`team-${teamId}`);
    });

    // Real-time message send
    socket.on('send-message', async ({ teamId, content }) => {
      try {
        if (!content || !content.trim()) return;

        const team = await Team.findById(teamId);
        if (!team || !isTeamMember(team, socket.user._id)) {
          socket.emit('chat-error', 'Not authorized to message this team');
          return;
        }

        const message = await Message.create({
          team: teamId,
          sender: socket.user._id,
          content: content.trim()
        });

        const payload = {
          _id: message._id,
          team: teamId,
          content: message.content,
          createdAt: message.createdAt,
          sender: {
            _id: socket.user._id,
            name: socket.user.name,
            email: socket.user.email
          }
        };

        // Broadcast to everyone in the room, including the sender
        io.to(`team-${teamId}`).emit('new-message', payload);
      } catch (err) {
        console.error('❌ send-message error:', err.message);
        socket.emit('chat-error', 'Failed to send message');
      }
    });

    // Typing indicator
    socket.on('typing', ({ teamId, isTyping }) => {
      socket.to(`team-${teamId}`).emit('user-typing', {
        userId: socket.user._id,
        name: socket.user.name,
        isTyping
      });
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.user?.name);
    });
  });

  return io;
};
