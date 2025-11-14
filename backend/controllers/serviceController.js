const crypto = require('crypto');
const Service = require('../models/Service');
const Car = require('../models/Car');

// @desc    Create new service
// @route   POST /api/services
// @access  Private
const createService = async (req, res) => {
  try {
    // Check if car exists and user has access to it
    const car = await Car.findById(req.body.car);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Check if user owns the car or is admin
    if (car.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add service to this car'
      });
    }

    const serviceData = {
      ...req.body,
      cost: Number(req.body.cost)
    };

    if (req.body.paymentDetails) {
      const {
        orderId,
        paymentId,
        signature,
        amount,
        currency,
        status
      } = req.body.paymentDetails;

      if (orderId && paymentId && signature) {
        if (!process.env.RAZORPAY_KEY_SECRET) {
          return res.status(500).json({
            success: false,
            message: 'Payment verification configuration missing on server'
          });
        }

        const generatedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
          .update(`${orderId}|${paymentId}`)
          .digest('hex');

        if (generatedSignature !== signature) {
          return res.status(400).json({
            success: false,
            message: 'Payment verification failed'
          });
        }

        serviceData.paymentDetails = {
          status: status || 'paid',
          orderId,
          paymentId,
          signature,
          amount: amount ? Number(amount) : Number(req.body.cost),
          currency: currency || 'INR',
          paidAt: new Date()
        };
      }
    }

    const service = await Service.create(serviceData);

    // Add service to car's services array
    await Car.findByIdAndUpdate(
      req.body.car,
      { $push: { services: service._id } },
      { new: true }
    );

    const populatedService = await Service.findById(service._id)
      .populate('car', 'brand model year');

    res.status(201).json({
      success: true,
      message: 'Service added successfully',
      data: populatedService
    });
  } catch (error) {
    console.error('Create service error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get services for a car
// @route   GET /api/services/:carId
// @access  Private
const getCarServices = async (req, res) => {
  try {
    // Check if car exists
    const car = await Car.findById(req.params.carId);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Allow all authenticated users to view service history
    const services = await Service.find({ car: req.params.carId })
      .populate('car', 'brand model year')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Get car services error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private
const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user owns the car or is admin
    const car = await Car.findById(service.car);
    if (car.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    const updateData = {
      ...req.body,
      ...(req.body.cost !== undefined ? { cost: Number(req.body.cost) } : {})
    };

    if (req.body.paymentDetails) {
      const {
        orderId,
        paymentId,
        signature,
        amount,
        currency,
        status
      } = req.body.paymentDetails;

      if (orderId && paymentId && signature) {
        if (!process.env.RAZORPAY_KEY_SECRET) {
          return res.status(500).json({
            success: false,
            message: 'Payment verification configuration missing on server'
          });
        }

        const generatedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
          .update(`${orderId}|${paymentId}`)
          .digest('hex');

        if (generatedSignature !== signature) {
          return res.status(400).json({
            success: false,
            message: 'Payment verification failed'
          });
        }

        updateData.paymentDetails = {
          status: status || 'paid',
          orderId,
          paymentId,
          signature,
          amount: amount ? Number(amount) : Number(req.body.cost ?? service.cost),
          currency: currency || service.paymentDetails?.currency || 'INR',
          paidAt: new Date()
        };
      }
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('car', 'brand model year');

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
    });
  } catch (error) {
    console.error('Update service error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user owns the car or is admin
    const car = await Car.findById(service.car);
    if (car.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this service'
      });
    }

    // Remove service from car's services array
    await Car.findByIdAndUpdate(
      service.car,
      { $pull: { services: service._id } },
      { new: true }
    );

    await Service.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all services (Admin only)
// @route   GET /api/services
// @access  Private/Admin
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({})
      .populate('car', 'brand model year owner')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Get all services error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createService,
  getCarServices,
  updateService,
  deleteService,
  getAllServices
};
