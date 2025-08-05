const express = require('express');
const { body, query, param } = require('express-validator');
const {
  createRemainder,
  getRemainders,
  getRemainder,
  updateRemainder,
  deleteRemainder,
  getUpcomingRemainders
} = require('../controllers/remainderController');

const router = express.Router();

// Validation rules
const remainderValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('phone')
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('occasion')
    .isIn(['birthday', 'anniversary', 'meeting', 'appointment', 'other'])
    .withMessage('Invalid occasion type'),
  body('date')
    .isISO8601()
    .withMessage('Please enter a valid date')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Date cannot be in the past');
      }
      return true;
    }),
  body('time')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please enter time in HH:MM format (24-hour)'),
  body('relationship')
    .isIn(['father', 'mother', 'brother', 'sister', 'friend', 'colleague', 'spouse', 'child', 'other'])
    .withMessage('Invalid relationship type')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid remainder ID')
];

const queryValidation = [
  query('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  query('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Routes
router.post('/', remainderValidation, createRemainder);
router.get('/', queryValidation, getRemainders);
router.get('/upcoming', queryValidation, getUpcomingRemainders);
router.get('/:id', idValidation, getRemainder);
router.put('/:id', [...idValidation, ...remainderValidation], updateRemainder);
router.delete('/:id', idValidation, deleteRemainder);

module.exports = router;