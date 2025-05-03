'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// Mock data for categories
const categories = [
  { id: 1, name: 'Starters', image: '/starters.jpg', count: 12 },
  { id: 2, name: 'Main Course', image: '/main-course.jpg', count: 24 },
  { id: 3, name: 'Beverages', image: '/beverages.jpg', count: 18 },
  { id: 4, name: 'Desserts', image: '/desserts.jpg', count: 15 },
  { id: 5, name: 'Salads', image: '/salads.jpg', count: 10 },
  { id: 6, name: 'Soups', image: '/soups.jpg', count: 8 },
  { id: 7, name: 'Sides', image: '/sides.jpg', count: 14 },
  { id: 8, name: 'Specials', image: '/specials.jpg', count: 6 },
];

export default function CategorySlider() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollable = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { clientWidth } = sliderRef.current;
      const scrollAmount = clientWidth * 0.8;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      
      // Update buttons after scroll animation
      setTimeout(checkScrollable, 300);
    }
  };

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Scroll left"
        >
          <ChevronLeftIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        </button>
      )}
      
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Scroll right"
        >
          <ChevronRightIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        </button>
      )}
      
      {/* Category Slider */}
      <div 
        ref={sliderRef}
        className="flex overflow-x-auto scrollbar-hide space-x-6 pb-4 pt-2 px-2 -mx-2"
        onScroll={checkScrollable}
      >
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="flex-shrink-0 w-40 md:w-48"
          >
            <Link href={`/menu?category=${category.id}`}>
              <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 h-full">
                <div className="h-32 bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold">{category.name}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{category.count} items</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
