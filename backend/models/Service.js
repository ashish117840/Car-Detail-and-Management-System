const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: [true, 'Please provide a car reference']
  },
  date: {
    type: Date,
    required: [true, 'Please provide a service date'],
    default: Date.now
  },
  description: {
    type: String,
    required: [true, 'Please provide a service description'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  cost: {
    type: Number,
    required: [true, 'Please provide the service cost'],
    min: [0, 'Cost cannot be negative']
  },
  serviceType: {
    type: String,
    enum: ['maintenance', 'repair', 'inspection', 'detailing', 'other'],
    default: 'maintenance'
  },
  nextServiceDate: {
    type: Date
  },
  serviceProvider: {
    type: String,
    trim: true,
    maxlength: [100, 'Service provider name cannot be more than 100 characters']
  },
  paymentDetails: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    orderId: String,
    paymentId: String,
    signature: String,
    amount: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    paidAt: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
serviceSchema.index({ car: 1, date: -1 });

module.exports = mongoose.model('Service', serviceSchema);
