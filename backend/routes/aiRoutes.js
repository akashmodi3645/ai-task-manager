import express from 'express';
import {
  parseNaturalLanguageTask,
  getPrioritySuggestions,
  breakdownTask,
  getDailySummary,
  analyzeTask,           // NEW
  suggestTimeBlock       // NEW
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/parse', parseNaturalLanguageTask);
router.get('/suggestions', getPrioritySuggestions);
router.post('/breakdown/:taskId', breakdownTask);
router.get('/daily-summary', getDailySummary);
router.get('/analyze/:taskId', analyzeTask);          // NEW
router.get('/time-block', suggestTimeBlock);          // NEW

export default router;
