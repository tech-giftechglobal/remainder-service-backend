const mongoose = require('mongoose');

const remainderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please enter a valid phone number'
    ]
  },
  occasion: {
    type: String,
    required: [true, 'Occasion is required'],
    enum: {
      values: ['birthday', 'anniversary', 'meeting', 'appointment', 'other'],
      message: '{VALUE} is not a valid occasion type'
    }
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date();
      },
      message: 'Date cannot be in the past'
    }
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
    match: [
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'Please enter time in HH:MM format (24-hour)'
    ]
  },
  relationship: {
    type: String,
    required: [true, 'Relationship is required'],
    enum: {
      values: ['father', 'mother', 'brother', 'sister', 'friend', 'colleague', 'spouse', 'child', 'other'],
      message: '{VALUE} is not a valid relationship type'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
remainderSchema.index({ email: 1, date: 1 });
remainderSchema.index({ phone: 1 });

module.exports = mongoose.model('Remainder', remainderSchema);