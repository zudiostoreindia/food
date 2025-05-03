'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

// Mock data for featured items
const featuredItems = [
  {
    id: 1,
    name: 'Classic Burger',
    description: 'Juicy beef patty with cheese, lettuce, tomato, and special sauce',
    price: 12.99,
    image: '/burger.jpg',
    category: 'Main Course',
    rating: 4.8,
    reviewCount: 124,
    dietaryTags: ['non-veg'],
  },
  {
    id: 2,
    name: 'Margherita Pizza',
    description: 'Traditional pizza with tomato sauce, mozzarella, and fresh basil',
    price: 14.99,
    image: '/pizza.jpg',
    category: 'Main Course',
    rating: 4.7,
    reviewCount: 98,
    dietaryTags: ['vegetarian'],
  },
  {
    id: 3,
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan',
    price: 9.99,
    image: '/salad.jpg',
    category: 'Salads',
    rating: 4.5,
    reviewCount: 76,
    dietaryTags: ['vegetarian'],
  },
  {
    id: 4,
    name: 'Chocolate Brownie',
    description: 'Rich chocolate brownie with vanilla ice cream and chocolate sauce',
    price: 6.99,
    image: '/brownie.jpg',
    category: 'Desserts',
    rating: 4.9,
    reviewCount: 152,
    dietaryTags: ['vegetarian'],
  },
];

export default function FeaturedItems() {
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {featuredItems.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="card group"
        >
          {/* Food Image */}
          <div className="relative h-48 bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center overflow-hidden">
            <span className="text-white font-bold">Food Image</span>
            
            {/* Favorite Button */}
            <button
              onClick={() => toggleFavorite(item.id)}
              className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label={favorites.includes(item.id) ? "Remove from favorites" : "Add to favorites"}
            >
              {favorites.includes(item.id) ? (
                <HeartSolidIcon className="h-5 w-5 text-red-600" />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            
            {/* Dietary Tags */}
            <div className="absolute bottom-2 left-2 flex space-x-1">
              {item.dietaryTags.includes('vegetarian') && (
                <span className="badge badge-veg">Veg</span>
              )}
              {item.dietaryTags.includes('non-veg') && (
                <span className="badge badge-non-veg">Non-Veg</span>
              )}
              {item.dietaryTags.includes('spicy') && (
                <span className="badge badge-spicy">Spicy</span>
              )}
            </div>
          </div>
          
          {/* Food Details */}
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <Link href={`/menu/${item.id}`} className="hover:text-red-600 transition-colors duration-200">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{item.name}</h3>
              </Link>
              <span className="text-red-600 font-bold">${item.price.toFixed(2)}</span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{item.description}</p>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">({item.reviewCount})</span>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">{item.category}</span>
            </div>
            
            <button className="w-full btn-primary flex items-center justify-center space-x-2">
              <ShoppingCartIcon className="h-5 w-5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
