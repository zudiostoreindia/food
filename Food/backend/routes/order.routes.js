const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../models/order.model');
const Table = require('../models/table.model');
const User = require('../models/user.model');
const FoodItem = require('../models/foodItem.model');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

// @route   GET api/orders
// @desc    Get all orders for current user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.foodItem', 'name price image');
      
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/orders/all
// @desc    Get all orders (admin only)
// @access  Private/Admin
router.get('/all', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { status, orderType, fromDate, toDate } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (orderType) {
      query.orderType = orderType;
    }
    
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) {
        query.createdAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        query.createdAt.$lte = new Date(toDate);
      }
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone')
      .populate('items.foodItem', 'name price image');
      
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.foodItem', 'name price image')
      .populate('appliedOffers');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is authorized to view this order
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/orders
// @desc    Create a new order
// @access  Private
router.post('/', [
  authMiddleware,
  body('items', 'Items are required').isArray().notEmpty(),
  body('orderType', 'Order type is required').isIn(['dine-in', 'delivery', 'takeout']),
  body('paymentMethod', 'Payment method is required').isIn(['credit-card', 'debit-card', 'cash', 'wallet'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      items,
      orderType,
      tableNumber,
      deliveryAddress,
      specialInstructions,
      appliedOffers,
      paymentMethod,
      paymentId,
      pointsRedeemed,
      tip
    } = req.body;
    
    // Validate items
    const itemsWithDetails = [];
    let subtotal = 0;
    
    for (const item of items) {
      const foodItem = await FoodItem.findById(item.foodItem);
      if (!foodItem) {
        return res.status(400).json({ message: `Food item not found: ${item.foodItem}` });
      }
      
      if (!foodItem.isAvailable) {
        return res.status(400).json({ message: `Food item not available: ${foodItem.name}` });
      }
      
      itemsWithDetails.push({
        foodItem: foodItem._id,
        quantity: item.quantity,
        price: foodItem.price,
        specialInstructions: item.specialInstructions || ''
      });
      
      subtotal += foodItem.price * item.quantity;
    }
    
    // Validate table for dine-in orders
    if (orderType === 'dine-in') {
      if (!tableNumber) {
        return res.status(400).json({ message: 'Table number is required for dine-in orders' });
      }
      
      const table = await Table.findOne({ tableNumber });
      if (!table) {
        return res.status(400).json({ message: 'Invalid table number' });
      }
      
      if (table.isOccupied && !table.currentOrder) {
        return res.status(400).json({ message: 'Table is already occupied' });
      }
    }
    
    // Validate delivery address for delivery orders
    if (orderType === 'delivery' && !deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required for delivery orders' });
    }
    
    // Calculate tax (assuming 10% tax rate)
    const taxRate = 0.1;
    const tax = subtotal * taxRate;
    
    // Calculate delivery fee
    const deliveryFee = orderType === 'delivery' ? 5 : 0;
    
    // Calculate discount from offers
    let discount = 0;
    // Note: In a real app, you would validate offers and calculate actual discounts
    
    // Calculate points redemption (1 point = $0.10)
    let pointsDiscount = 0;
    if (pointsRedeemed && pointsRedeemed > 0) {
      const user = await User.findById(req.user.id);
      if (pointsRedeemed > user.rewardPoints) {
        return res.status(400).json({ message: 'Not enough reward points' });
      }
      
      pointsDiscount = pointsRedeemed * 0.1;
      discount += pointsDiscount;
    }
    
    // Calculate total
    const total = subtotal + tax + deliveryFee + (tip || 0) - discount;
    
    // Create new order
    const newOrder = new Order({
      user: req.user.id,
      items: itemsWithDetails,
      orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      status: 'pending',
      subtotal,
      tax,
      deliveryFee,
      tip: tip || 0,
      discount,
      total,
      paymentMethod,
      paymentId,
      specialInstructions,
      appliedOffers,
      pointsRedeemed: pointsRedeemed || 0
    });
    
    const order = await newOrder.save();
    
    // Update table status if dine-in
    if (orderType === 'dine-in') {
      await Table.findOneAndUpdate(
        { tableNumber },
        { 
          isOccupied: true,
          currentOrder: order._id
        }
      );
    }
    
    // Update user's reward points
    if (pointsRedeemed && pointsRedeemed > 0) {
      await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { rewardPoints: -pointsRedeemed } }
      );
    }
    
    // Add reward points earned from this order
    const pointsEarned = Math.floor(total);
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { rewardPoints: pointsEarned } }
    );
    
    // Update order with points earned
    order.pointsEarned = pointsEarned;
    await order.save();
    
    // Emit socket event for new order
    req.app.get('io').to('admin').emit('newOrder', {
      orderId: order._id,
      status: order.status,
      orderType: order.orderType,
      tableNumber: order.tableNumber,
      items: order.items.length
    });
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', [
  authMiddleware,
  adminMiddleware,
  body('status', 'Status is required').isIn(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id).populate('user', 'id');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order status
    order.status = status;
    await order.save();
    
    // If order is completed or cancelled, free up the table
    if ((status === 'completed' || status === 'cancelled') && order.orderType === 'dine-in') {
      await Table.findOneAndUpdate(
        { tableNumber: order.tableNumber },
        { 
          isOccupied: false,
          currentOrder: null
        }
      );
    }
    
    // Emit socket event for order status update
    const io = req.app.get('io');
    io.to('admin').emit('orderStatusUpdate', {
      orderId: order._id,
      status: order.status,
      updatedAt: order.updatedAt
    });
    
    io.to(`user-${order.user._id}`).emit('orderStatusUpdate', {
      orderId: order._id,
      status: order.status,
      updatedAt: order.updatedAt
    });
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is authorized to cancel this order
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }
    
    // Update order status
    order.status = 'cancelled';
    await order.save();
    
    // If dine-in order, free up the table
    if (order.orderType === 'dine-in') {
      await Table.findOneAndUpdate(
        { tableNumber: order.tableNumber },
        { 
          isOccupied: false,
          currentOrder: null
        }
      );
    }
    
    // Refund reward points if they were used
    if (order.pointsRedeemed > 0) {
      await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { rewardPoints: order.pointsRedeemed } }
      );
    }
    
    // Emit socket event for order status update
    const io = req.app.get('io');
    io.to('admin').emit('orderStatusUpdate', {
      orderId: order._id,
      status: order.status,
      updatedAt: order.updatedAt
    });
    
    io.to(`user-${order.user}`).emit('orderStatusUpdate', {
      orderId: order._id,
      status: order.status,
      updatedAt: order.updatedAt
    });
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/orders/:id/reorder
// @desc    Create a new order based on a previous order
// @access  Private
router.post('/:id/reorder', authMiddleware, async (req, res) => {
  try {
    const originalOrder = await Order.findById(req.params.id);
    
    if (!originalOrder) {
      return res.status(404).json({ message: 'Original order not found' });
    }
    
    // Check if user is authorized to reorder this order
    if (originalOrder.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Check availability of all items
    const itemsWithDetails = [];
    let subtotal = 0;
    
    for (const item of originalOrder.items) {
      const foodItem = await FoodItem.findById(item.foodItem);
      if (!foodItem || !foodItem.isAvailable) {
        continue; // Skip unavailable items
      }
      
      itemsWithDetails.push({
        foodItem: foodItem._id,
        quantity: item.quantity,
        price: foodItem.price,
        specialInstructions: item.specialInstructions || ''
      });
      
      subtotal += foodItem.price * item.quantity;
    }
    
    if (itemsWithDetails.length === 0) {
      return res.status(400).json({ message: 'None of the items in the original order are available' });
    }
    
    // Calculate tax (assuming 10% tax rate)
    const taxRate = 0.1;
    const tax = subtotal * taxRate;
    
    // Calculate delivery fee
    const deliveryFee = originalOrder.orderType === 'delivery' ? 5 : 0;
    
    // Calculate total
    const total = subtotal + tax + deliveryFee;
    
    // Create new order
    const newOrder = new Order({
      user: req.user.id,
      items: itemsWithDetails,
      orderType: originalOrder.orderType,
      tableNumber: originalOrder.orderType === 'dine-in' ? req.body.tableNumber : undefined,
      deliveryAddress: originalOrder.orderType === 'delivery' ? originalOrder.deliveryAddress : undefined,
      status: 'pending',
      subtotal,
      tax,
      deliveryFee,
      total,
      paymentMethod: req.body.paymentMethod || originalOrder.paymentMethod
    });
    
    const order = await newOrder.save();
    
    // Update table status if dine-in
    if (originalOrder.orderType === 'dine-in' && req.body.tableNumber) {
      await Table.findOneAndUpdate(
        { tableNumber: req.body.tableNumber },
        { 
          isOccupied: true,
          currentOrder: order._id
        }
      );
    }
    
    // Add reward points earned from this order
    const pointsEarned = Math.floor(total);
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { rewardPoints: pointsEarned } }
    );
    
    // Update order with points earned
    order.pointsEarned = pointsEarned;
    await order.save();
    
    // Emit socket event for new order
    req.app.get('io').to('admin').emit('newOrder', {
      orderId: order._id,
      status: order.status,
      orderType: order.orderType,
      tableNumber: order.tableNumber,
      items: order.items.length
    });
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
