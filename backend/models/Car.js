const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: [true, 'Please provide a car brand'],
    trim: true,
    maxlength: [50, 'Brand name cannot be more than 50 characters']
  },
  model: {
    type: String,
    required: [true, 'Please provide a car model'],
    trim: true,
    maxlength: [50, 'Model name cannot be more than 50 characters']
  },
  year: {
    type: Number,
    required: [true, 'Please provide the car year'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  price: {
    type: Number,
    required: [true, 'Please provide the car price'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  color: {
    type: String,
    trim: true,
    maxlength: [30, 'Color cannot be more than 30 characters']
  },
  mileage: {
    type: Number,
    min: [0, 'Mileage cannot be negative']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  image: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
carSchema.index({ owner: 1 });
carSchema.index({ brand: 1, model: 1 });

module.exports = mongoose.model('Car', carSchema);
