const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  image: {
    type: String,
    required: true
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  dietaryTags: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'low-carb', 'keto', 'paleo', 'spicy']
  }],
  allergens: [{
    type: String,
    enum: ['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'shellfish', 'fish']
  }],
  preparationTime: {
    type: Number, // in minutes
    default: 15
  },
  calories: {
    type: Number,
    min: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  ratings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
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

// Calculate average rating before saving
foodItemSchema.pre('save', function(next) {
  if (this.ratings && this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((sum, item) => sum + item.rating, 0);
    this.averageRating = totalRating / this.ratings.length;
  }
  next();
});

const FoodItem = mongoose.model('FoodItem', foodItemSchema);

module.exports = FoodItem;
