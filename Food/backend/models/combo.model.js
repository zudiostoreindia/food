const mongoose = require('mongoose');

const comboSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
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
      min: 1,
      default: 1
    }
  }],
  regularPrice: {
    type: Number,
    required: true,
    min: 0
  },
  comboPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: function() {
      return this.regularPrice - this.comboPrice;
    }
  },
  discountPercentage: {
    type: Number,
    default: function() {
      return Math.round((this.discount / this.regularPrice) * 100);
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validTo: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      return date;
    }
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

// Virtual for checking if combo is expired
comboSchema.virtual('isExpired').get(function() {
  return Date.now() > this.validTo;
});

// Virtual for checking if combo is valid
comboSchema.virtual('isValid').get(function() {
  return this.isAvailable && !this.isExpired;
});

const Combo = mongoose.model('Combo', comboSchema);

module.exports = Combo;
