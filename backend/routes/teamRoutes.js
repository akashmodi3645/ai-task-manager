import express from 'express';
import {
  createTeam,
  getUserTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  inviteMember,
  removeMember,
  acceptInvitation,
  getTeamDashboard,
  getTeamTasks,
  assignTaskAI,        // ✅ Correct name
  assignTask,
  getMyAssignedTasks
} from '../controllers/teamController.js';
import { getTeamMessages, sendTeamMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Team CRUD
router.route('/')
  .post(createTeam)
  .get(getUserTeams);

router.route('/:id')
  .get(getTeamById)
  .put(updateTeam)
  .delete(deleteTeam);

// Team Actions
router.post('/:teamId/invite', inviteMember);
router.delete('/:teamId/members/:memberId', removeMember);
router.post('/accept-invitation', acceptInvitation);
router.get('/:teamId/dashboard', getTeamDashboard);
router.get('/:teamId/tasks', getTeamTasks);
router.post('/:teamId/assign-ai', assignTaskAI);  // ✅ Using correct function
router.post('/assign-task', assignTask);
router.get('/my-assigned-tasks', getMyAssignedTasks);

// Group chat
router.get('/:teamId/messages', getTeamMessages);
router.post('/:teamId/messages', sendTeamMessage);

export default router;
