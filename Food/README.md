# Food Ordering System

A full-stack, responsive web application for an Online Food Ordering System with modern UI, real-time features, QR code support, and admin controls.

## Features

### User Panel
- Dynamic Menu with categories (Starters, Main Course, Beverages, Desserts, etc.)
- Detailed food items with images, price, ingredients, dietary tags
- Cart functionality (add, update quantity, remove items)
- Multiple order types: dine-in (table selection), delivery, takeout
- QR code support for table orders
- Combo offers and discounts
- Real-time order status tracking
- Order history and reorder functionality
- Favorites and loyalty points system
- Dietary filters and AI-based suggestions
- Dark mode and voice search
- Mobile-first responsive design

### Admin Panel
- Secure authentication
- Menu management (items, categories, combos, offers)
- Live order tracking and status management
- Table status management
- Sales analytics and reporting
- User feedback management
- Multi-branch support

## Tech Stack

### Frontend
- React / Next.js
- Tailwind CSS
- Framer Motion for animations
- Redux for state management
- PWA support

### Backend
- Node.js with Express
- MongoDB for database
- WebSockets for real-time updates
- JWT for authentication
- Stripe for payment processing

## Setup Instructions

### Prerequisites
1. Node.js (v16 or higher)
2. MongoDB
3. npm or yarn

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

## Project Structure
```
food-ordering-system/
├── frontend/                 # Next.js frontend application
│   ├── public/               # Static assets
│   └── src/                  # Source code
│       ├── app/              # App router pages
│       ├── components/       # React components
│       ├── context/          # React context providers
│       ├── hooks/            # Custom React hooks
│       ├── lib/              # Utility functions
│       └── styles/           # Global styles
│
├── backend/                  # Express backend application
│   ├── config/               # Configuration files
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Custom middleware
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   └── utils/                # Utility functions
│
└── shared/                   # Shared code between frontend and backend
    └── types/                # TypeScript type definitions
```

## Database Schema

The application uses MongoDB with the following collections:
- Users
- FoodItems
- Categories
- Orders
- OrderItems
- Tables
- Offers
- Combos
- Admins
- Branches
- Feedback
- QRCodes

## License
MIT
