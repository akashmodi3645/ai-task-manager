import express from 'express';
import { 
  signup, 
  login, 
  refresh, 
  logout, 
  getProfile, 
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { 
  validateSignup, 
  validateLogin, 
  handleValidationErrors 
} from '../middleware/validation.js';

const router = express.Router();

router.post('/signup', validateSignup, handleValidationErrors, signup);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
