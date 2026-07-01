import Team from '../models/Team.js';
import Message from '../models/Message.js';

// Helper: confirm the requesting user belongs to the team
const isTeamMember = (team, userId) => {
  const uid = userId.toString();
  return (
    team.owner.toString() === uid ||
    team.members.some((m) => m.user.toString() === uid)
  );
};

// GET /api/teams/:teamId/messages
// Returns the most recent messages for a team, oldest first.
export const getTeamMessages = async (req, res) => {
  try {
    const { teamId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (!isTeamMember(team, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not a team member' });
    }

    const messages = await Message.find({ team: teamId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'name email')
      .lean();

    // Return in chronological order (oldest first) for easy rendering
    messages.reverse();

    res.json({ success: true, messages });
  } catch (error) {
    console.error('❌ Failed to fetch messages:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/teams/:teamId/messages
// REST fallback for sending a message (the socket path is primary).
export const sendTeamMessage = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (!isTeamMember(team, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not a team member' });
    }

    const message = await Message.create({
      team: teamId,
      sender: req.user._id,
      content: content.trim()
    });

    await message.populate('sender', 'name email');

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('❌ Failed to send message:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { isTeamMember };
