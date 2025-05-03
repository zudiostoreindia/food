const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Table = require('../models/table.model');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const qrCodeDir = path.join(__dirname, '../uploads/qrcodes');
if (!fs.existsSync(qrCodeDir)) {
  fs.mkdirSync(qrCodeDir, { recursive: true });
}

// Generate QR code for a table
const generateQRCode = async (tableNumber, baseUrl) => {
  const tableUrl = `${baseUrl}/table/${tableNumber}`;
  const qrCodePath = path.join(qrCodeDir, `table-${tableNumber}.png`);
  
  await QRCode.toFile(qrCodePath, tableUrl, {
    color: {
      dark: '#000',
      light: '#FFF'
    },
    width: 300,
    margin: 1
  });
  
  return `/uploads/qrcodes/table-${tableNumber}.png`;
};

// @route   GET api/tables
// @desc    Get all tables
// @access  Public
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/tables/:tableNumber
// @desc    Get table by number
// @access  Public
router.get('/:tableNumber', async (req, res) => {
  try {
    const table = await Table.findOne({ tableNumber: req.params.tableNumber })
      .populate({
        path: 'currentOrder',
        select: 'status items createdAt',
        populate: {
          path: 'items.foodItem',
          select: 'name price image'
        }
      });
    
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    res.json(table);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/tables
// @desc    Create a new table
// @access  Private/Admin
router.post('/', [
  authMiddleware,
  adminMiddleware,
  body('tableNumber', 'Table number is required').isNumeric(),
  body('capacity', 'Capacity is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { tableNumber, capacity, section, branch } = req.body;
    
    // Check if table already exists
    let table = await Table.findOne({ tableNumber });
    if (table) {
      return res.status(400).json({ message: 'Table already exists' });
    }
    
    // Generate QR code
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrCode = await generateQRCode(tableNumber, baseUrl);
    
    // Create new table
    table = new Table({
      tableNumber,
      capacity,
      section: section || 'indoor',
      qrCode,
      branch: branch || null
    });
    
    await table.save();
    res.json(table);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/tables/:tableNumber
// @desc    Update a table
// @access  Private/Admin
router.put('/:tableNumber', [
  authMiddleware,
  adminMiddleware
], async (req, res) => {
  try {
    const { capacity, isOccupied, section, branch } = req.body;
    
    // Build table object
    const tableFields = {};
    if (capacity) tableFields.capacity = capacity;
    if (isOccupied !== undefined) tableFields.isOccupied = isOccupied;
    if (section) tableFields.section = section;
    if (branch) tableFields.branch = branch;
    
    // If table is marked as not occupied, clear current order
    if (isOccupied === false) {
      tableFields.currentOrder = null;
    }
    
    let table = await Table.findOne({ tableNumber: req.params.tableNumber });
    
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    // Update
    table = await Table.findOneAndUpdate(
      { tableNumber: req.params.tableNumber },
      { $set: tableFields },
      { new: true }
    );
    
    res.json(table);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/tables/:tableNumber
// @desc    Delete a table
// @access  Private/Admin
router.delete('/:tableNumber', [
  authMiddleware,
  adminMiddleware
], async (req, res) => {
  try {
    const table = await Table.findOne({ tableNumber: req.params.tableNumber });
    
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    // Check if table is occupied
    if (table.isOccupied) {
      return res.status(400).json({ message: 'Cannot delete an occupied table' });
    }
    
    // Delete QR code file
    const qrCodePath = path.join(__dirname, '..', table.qrCode);
    if (fs.existsSync(qrCodePath)) {
      fs.unlinkSync(qrCodePath);
    }
    
    await table.remove();
    res.json({ message: 'Table removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/tables/:tableNumber/qrcode
// @desc    Get QR code for a table
// @access  Public
router.get('/:tableNumber/qrcode', async (req, res) => {
  try {
    const table = await Table.findOne({ tableNumber: req.params.tableNumber });
    
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    res.json({ qrCode: table.qrCode });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/tables/:tableNumber/regenerate-qrcode
// @desc    Regenerate QR code for a table
// @access  Private/Admin
router.post('/:tableNumber/regenerate-qrcode', [
  authMiddleware,
  adminMiddleware
], async (req, res) => {
  try {
    const table = await Table.findOne({ tableNumber: req.params.tableNumber });
    
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    // Generate new QR code
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrCode = await generateQRCode(table.tableNumber, baseUrl);
    
    // Update table
    table.qrCode = qrCode;
    await table.save();
    
    res.json(table);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
