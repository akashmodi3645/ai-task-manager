import { body, validationResult } from 'express-validator';

export const validateSignup = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const validateTask = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    
    // ✅ Return user-friendly error
    const firstError = errors.array()[0];
    return res.status(400).json({ 
      message: firstError.msg,
      errors: errors.array() 
    });
  }
  next();
};
