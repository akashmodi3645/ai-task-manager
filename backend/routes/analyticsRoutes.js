import express from 'express';
import { 
  getDashboardStats, 
  getProductivityTrends 
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/trends', getProductivityTrends);

export default router;
