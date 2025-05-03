const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    foodItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    specialInstructions: {
      type: String
    }
  }],
  orderType: {
    type: String,
    enum: ['dine-in', 'delivery', 'takeout'],
    required: true
  },
  tableNumber: {
    type: Number,
    required: function() {
      return this.orderType === 'dine-in';
    }
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    required: function() {
      return this.orderType === 'delivery';
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  tip: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['credit-card', 'debit-card', 'cash', 'wallet'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  estimatedDeliveryTime: {
    type: Date
  },
  specialInstructions: {
    type: String
  },
  appliedOffers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  }],
  pointsEarned: {
    type: Number,
    default: 0
  },
  pointsRedeemed: {
    type: Number,
    default: 0
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate total before saving
orderSchema.pre('save', function(next) {
  // Calculate subtotal from items
  if (this.isModified('items')) {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
  
  // Calculate total
  this.total = this.subtotal + this.tax + this.deliveryFee + this.tip - this.discount;
  
  // Calculate points earned (1 point per $1 spent)
  this.pointsEarned = Math.floor(this.total);
  
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
