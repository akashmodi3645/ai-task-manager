import axios from 'axios';
import Team from '../models/Team.js';
import dotenv from 'dotenv';

// 🔥 Reload dotenv
dotenv.config();

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = 'https://api.daily.co/v1';  // ✅ CORRECT!

// Debug logs
console.log('🔧 Meeting Controller Loaded');
console.log('🔑 DAILY_API_KEY:', DAILY_API_KEY ? '✅ Present' : '❌ Missing');
console.log('🔑 Length:', DAILY_API_KEY?.length);
// Create meeting room
export const createMeetingRoom = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    console.log('🎥 Creating Jitsi meeting for team:', teamId);
    
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is team member or owner
    const isMember = team.members.some(
      m => m.user.toString() === req.user._id.toString()
    ) || team.owner.toString() === req.user._id.toString();

    if (!isMember) {
      return res.status(403).json({ message: 'Not a team member' });
    }

    // Generate unique room name (no API call needed!)
    const roomName = `team-${teamId}-${Date.now()}`;
    const roomUrl = `https://meet.jit.si/${roomName}`;

    console.log('✅ Room created:', roomUrl);

    // Save meeting to database
    const meeting = {
      roomUrl,
      roomName,
      createdBy: req.user._id,
      createdAt: new Date(),
      participants: [req.user._id],
      status: 'active'
    };

    team.meetings = team.meetings || [];
    team.meetings.push(meeting);
    await team.save();

    res.json({
      success: true,
      message: 'Meeting room created! 🎥',
      roomUrl,
      roomName,
      meeting
    });

  } catch (error) {
    console.error('❌ Meeting creation error:', error.message);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get team meetings
export const getTeamMeetings = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const team = await Team.findById(teamId)
      .populate('meetings.createdBy', 'name email')
      .populate('meetings.participants', 'name email');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Filter active meetings
    const activeMeetings = team.meetings?.filter(m => m.status === 'active') || [];

    res.json({ 
      success: true,
      meetings: activeMeetings 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Join meeting
export const joinMeeting = async (req, res) => {
  try {
    const { teamId, meetingId } = req.params;
    
    console.log('🎥 Joining meeting:', meetingId);
    
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const meeting = team.meetings.id(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Check if meeting is active
    if (meeting.status === 'ended') {
      return res.status(400).json({ message: 'Meeting has ended' });
    }

    // Add user to participants if not already
    if (!meeting.participants.includes(req.user._id)) {
      meeting.participants.push(req.user._id);
      await team.save();
      console.log('✅ Added user to participants');
    }

    res.json({
      success: true,
      message: 'Joining meeting...',
      roomUrl: meeting.roomUrl,
      roomName: meeting.roomName
    });

  } catch (error) {
    console.error('❌ Join error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// End meeting
export const endMeeting = async (req, res) => {
  try {
    const { teamId, meetingId } = req.params;
    
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const meeting = team.meetings.id(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Only creator or team owner can end meeting
    const canEnd = meeting.createdBy.toString() === req.user._id.toString() ||
                   team.owner.toString() === req.user._id.toString();

    if (!canEnd) {
      return res.status(403).json({ 
        message: 'Only meeting creator or team owner can end meeting' 
      });
    }

    meeting.status = 'ended';
    meeting.endedAt = new Date();
    await team.save();

    res.json({
      success: true,
      message: 'Meeting ended'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
