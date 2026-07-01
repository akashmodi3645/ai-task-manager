import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  getTodayTasks,
  getOverdueTasks
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateTask, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.get('/today', getTodayTasks);
router.get('/overdue', getOverdueTasks);
router.get('/:id', getTaskById);
router.post('/', validateTask, handleValidationErrors, createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/toggle', toggleTaskComplete);

export default router;
