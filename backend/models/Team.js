import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'viewer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    workload: {
      type: Number,
      default: 0
    }
  }],
  invitations: [{
    email: String,
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }],
  settings: {
    taskAutoAssignment: {
      type: Boolean,
      default: false
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    }
  },
  
  // 🔥 NEW: Add meetings field here
  meetings: [{
    roomUrl: {
      type: String,
      required: true
    },
    roomName: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    endedAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ['active', 'ended'],
      default: 'active'
    }
  }]
  
}, {
  timestamps: true
});

// ✅ This is correct! Prevents "Cannot overwrite model" error
const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);

export default Team;
