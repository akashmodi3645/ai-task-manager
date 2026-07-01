import express from 'express';
import {
  createMeetingRoom,
  getTeamMeetings,
  joinMeeting,
  endMeeting
} from '../controllers/meetingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Meeting routes
router.post('/teams/:teamId/meetings', createMeetingRoom);
router.get('/teams/:teamId/meetings', getTeamMeetings);
router.post('/teams/:teamId/meetings/:meetingId/join', joinMeeting);
router.post('/teams/:teamId/meetings/:meetingId/end', endMeeting);

export default router;
