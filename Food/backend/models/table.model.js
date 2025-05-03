const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  isOccupied: {
    type: Boolean,
    default: false
  },
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  qrCode: {
    type: String,
    required: true
  },
  section: {
    type: String,
    enum: ['indoor', 'outdoor', 'balcony', 'private'],
    default: 'indoor'
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

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
