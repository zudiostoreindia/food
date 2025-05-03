const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const FoodItem = require('../models/foodItem.model');
const Category = require('../models/category.model');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/food-items');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images only (jpeg, jpg, png, webp)!');
    }
  }
});

// @route   GET api/menu/categories
// @desc    Get all categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/menu/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/menu/categories
// @desc    Create a category
// @access  Private/Admin
router.post('/categories', [
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  body('name', 'Name is required').not().isEmpty(),
  body('description', 'Description is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, displayOrder } = req.body;
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    
    const newCategory = new Category({
      name,
      description,
      displayOrder: displayOrder || 0,
      image: req.file ? `/uploads/food-items/${req.file.filename}` : null
    });
    
    const category = await newCategory.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/menu/categories/:id
// @desc    Update a category
// @access  Private/Admin
router.put('/categories/:id', [
  authMiddleware,
  adminMiddleware,
  upload.single('image')
], async (req, res) => {
  try {
    const { name, description, displayOrder, isActive } = req.body;
    
    // Build category object
    const categoryFields = {};
    if (name) categoryFields.name = name;
    if (description) categoryFields.description = description;
    if (displayOrder) categoryFields.displayOrder = displayOrder;
    if (isActive !== undefined) categoryFields.isActive = isActive;
    if (req.file) categoryFields.image = `/uploads/food-items/${req.file.filename}`;
    
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Update
    category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: categoryFields },
      { new: true }
    );
    
    res.json(category);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/menu/categories/:id
// @desc    Delete a category
// @access  Private/Admin
router.delete('/categories/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    await category.remove();
    res.json({ message: 'Category removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/menu/items
// @desc    Get all food items
// @access  Public
router.get('/items', async (req, res) => {
  try {
    const { category, search, dietary, available } = req.query;
    
    // Build query
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (dietary) {
      query.dietaryTags = { $in: dietary.split(',') };
    }
    
    if (available === 'true') {
      query.isAvailable = true;
    }
    
    const foodItems = await FoodItem.find(query)
      .populate('category', 'name')
      .sort({ category: 1, name: 1 });
      
    res.json(foodItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/menu/items/:id
// @desc    Get food item by ID
// @access  Public
router.get('/items/:id', async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id).populate('category', 'name');
    
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    
    res.json(foodItem);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/menu/items
// @desc    Create a food item
// @access  Private/Admin
router.post('/items', [
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  body('name', 'Name is required').not().isEmpty(),
  body('description', 'Description is required').not().isEmpty(),
  body('price', 'Price is required').isNumeric(),
  body('category', 'Category is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      description,
      price,
      category,
      ingredients,
      dietaryTags,
      allergens,
      preparationTime,
      calories,
      isAvailable,
      isFeatured,
      branch
    } = req.body;
    
    // Check if food item already exists
    const existingItem = await FoodItem.findOne({ name, category });
    if (existingItem) {
      return res.status(400).json({ message: 'Food item already exists in this category' });
    }
    
    // Create new food item
    const newFoodItem = new FoodItem({
      name,
      description,
      price,
      category,
      image: req.file ? `/uploads/food-items/${req.file.filename}` : '/uploads/food-items/default.jpg',
      ingredients: ingredients ? ingredients.split(',').map(item => item.trim()) : [],
      dietaryTags: dietaryTags ? dietaryTags.split(',').map(tag => tag.trim()) : [],
      allergens: allergens ? allergens.split(',').map(allergen => allergen.trim()) : [],
      preparationTime: preparationTime || 15,
      calories: calories || 0,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isFeatured: isFeatured || false,
      branch: branch || null
    });
    
    const foodItem = await newFoodItem.save();
    res.json(foodItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/menu/items/:id
// @desc    Update a food item
// @access  Private/Admin
router.put('/items/:id', [
  authMiddleware,
  adminMiddleware,
  upload.single('image')
], async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      ingredients,
      dietaryTags,
      allergens,
      preparationTime,
      calories,
      isAvailable,
      isFeatured,
      branch
    } = req.body;
    
    // Build food item object
    const foodItemFields = {};
    if (name) foodItemFields.name = name;
    if (description) foodItemFields.description = description;
    if (price) foodItemFields.price = price;
    if (category) foodItemFields.category = category;
    if (req.file) foodItemFields.image = `/uploads/food-items/${req.file.filename}`;
    if (ingredients) foodItemFields.ingredients = ingredients.split(',').map(item => item.trim());
    if (dietaryTags) foodItemFields.dietaryTags = dietaryTags.split(',').map(tag => tag.trim());
    if (allergens) foodItemFields.allergens = allergens.split(',').map(allergen => allergen.trim());
    if (preparationTime) foodItemFields.preparationTime = preparationTime;
    if (calories) foodItemFields.calories = calories;
    if (isAvailable !== undefined) foodItemFields.isAvailable = isAvailable;
    if (isFeatured !== undefined) foodItemFields.isFeatured = isFeatured;
    if (branch) foodItemFields.branch = branch;
    
    let foodItem = await FoodItem.findById(req.params.id);
    
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    
    // Update
    foodItem = await FoodItem.findByIdAndUpdate(
      req.params.id,
      { $set: foodItemFields },
      { new: true }
    );
    
    res.json(foodItem);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/menu/items/:id
// @desc    Delete a food item
// @access  Private/Admin
router.delete('/items/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);
    
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    
    await foodItem.remove();
    res.json({ message: 'Food item removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
