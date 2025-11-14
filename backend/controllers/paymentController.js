const Razorpay = require('razorpay');

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', notes = {} } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required to initiate payment'
      });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway is not configured on the server'
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount: Math.round(Number(amount) * 100), // Convert to the smallest currency unit
      currency,
      receipt: `car-service-${Date.now()}`,
      notes: {
        userId: req.user?._id,
        email: req.user?.email,
        ...notes
      }
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to create payment order'
    });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification details are incomplete'
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway is not configured on the server'
      });
    }

    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('Verify Razorpay payment error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to verify payment'
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment
};

