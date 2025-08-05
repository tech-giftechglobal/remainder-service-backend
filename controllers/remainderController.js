const { validationResult } = require('express-validator');
const Remainder = require('../models/Remainder');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create new remainder
// @route   POST /api/remainders
// @access  Public
const createRemainder = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { name, email, phone, occasion, date, time, relationship } = req.body;

  const remainder = await Remainder.create({
    name,
    email,
    phone,
    occasion,
    date,
    time,
    relationship
  });

  res.status(201).json({
    success: true,
    message: 'Remainder created successfully',
    data: remainder
  });
});

// @desc    Get all remainders by email or phone
// @route   GET /api/remainders?email=xxx&phone=xxx
// @access  Public
const getRemainders = asyncHandler(async (req, res) => {
  const { email, phone, page = 1, limit = 10 } = req.query;

  if (!email && !phone) {
    return res.status(400).json({
      success: false,
      message: 'Email or phone number is required'
    });
  }

  const query = {};
  if (email) query.email = email.toLowerCase();
  if (phone) query.phone = phone;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { date: 1, time: 1 },
    lean: true
  };

  const skip = (options.page - 1) * options.limit;

  const remainders = await Remainder.find(query)
    .sort(options.sort)
    .skip(skip)
    .limit(options.limit)
    .lean();

  const total = await Remainder.countDocuments(query);

  res.status(200).json({
    success: true,
    message: 'Remainders retrieved successfully',
    data: remainders,
    pagination: {
      currentPage: options.page,
      totalPages: Math.ceil(total / options.limit),
      totalCount: total,
      hasNext: skip + remainders.length < total,
      hasPrev: options.page > 1
    }
  });
});

// @desc    Get single remainder by ID
// @route   GET /api/remainders/:id
// @access  Public
const getRemainder = asyncHandler(async (req, res) => {
  const remainder = await Remainder.findById(req.params.id);

  if (!remainder) {
    return res.status(404).json({
      success: false,
      message: 'Remainder not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Remainder retrieved successfully',
    data: remainder
  });
});

// @desc    Update remainder
// @route   PUT /api/remainders/:id
// @access  Public
const updateRemainder = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const remainder = await Remainder.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!remainder) {
    return res.status(404).json({
      success: false,
      message: 'Remainder not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Remainder updated successfully',
    data: remainder
  });
});

// @desc    Delete remainder
// @route   DELETE /api/remainders/:id
// @access  Public
const deleteRemainder = asyncHandler(async (req, res) => {
  const remainder = await Remainder.findByIdAndDelete(req.params.id);

  if (!remainder) {
    return res.status(404).json({
      success: false,
      message: 'Remainder not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Remainder deleted successfully',
    data: remainder
  });
});

// @desc    Get upcoming remainders (next 7 days)
// @route   GET /api/remainders/upcoming?email=xxx&phone=xxx
// @access  Public
const getUpcomingRemainders = asyncHandler(async (req, res) => {
  const { email, phone } = req.query;

  if (!email && !phone) {
    return res.status(400).json({
      success: false,
      message: 'Email or phone number is required'
    });
  }

  const query = {};
  if (email) query.email = email.toLowerCase();
  if (phone) query.phone = phone;

  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  query.date = {
    $gte: today,
    $lte: nextWeek
  };

  const remainders = await Remainder.find(query)
    .sort({ date: 1, time: 1 })
    .lean();

  res.status(200).json({
    success: true,
    message: 'Upcoming remainders retrieved successfully',
    data: remainders,
    count: remainders.length
  });
});

module.exports = {
  createRemainder,
  getRemainders,
  getRemainder,
  updateRemainder,
  deleteRemainder,
  getUpcomingRemainders
};