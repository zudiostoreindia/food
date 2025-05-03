'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const [orderType, setOrderType] = useState<'delivery' | 'takeout' | 'dine-in'>('delivery');

  return (
    <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
              Delicious Food <span className="text-red-600">Delivered</span> To Your Door
            </h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8">
              Order your favorite meals from the best restaurants in town. Fast delivery, easy payment, and a wide variety of cuisines to choose from.
            </p>

            {/* Order Type Selector */}
            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md mb-6 inline-flex">
              <button
                onClick={() => setOrderType('delivery')}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  orderType === 'delivery'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Delivery
              </button>
              <button
                onClick={() => setOrderType('takeout')}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  orderType === 'takeout'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Takeout
              </button>
              <button
                onClick={() => setOrderType('dine-in')}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  orderType === 'dine-in'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Dine-in
              </button>
            </div>

            {/* CTA Button */}
            <Link href="/menu">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-lg px-8 py-3"
              >
                {orderType === 'delivery' && 'Order Delivery Now'}
                {orderType === 'takeout' && 'Order Takeout Now'}
                {orderType === 'dine-in' && 'Reserve a Table'}
              </motion.button>
            </Link>

            {/* Features */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mb-2">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mb-2">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Easy Ordering</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mb-2">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Secure Payment</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-[300px] md:h-[400px] lg:h-[500px]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl overflow-hidden flex items-center justify-center">
              <div className="text-white text-center p-8">
                <h3 className="text-2xl font-bold mb-2">Hero Image Placeholder</h3>
                <p>Food image would be displayed here</p>
              </div>
            </div>
            
            {/* Floating Elements */}
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                repeat: Infinity,
                duration: 4,
                ease: "easeInOut" 
              }}
              className="absolute -top-10 -right-5 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg"
            >
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </motion.div>
            
            <motion.div
              animate={{ 
                y: [0, 15, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                repeat: Infinity,
                duration: 5,
                ease: "easeInOut" 
              }}
              className="absolute -bottom-5 -left-5 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg"
            >
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Wave Shape Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
          <path 
            fill="currentColor" 
            fillOpacity="1" 
            className="text-white dark:text-gray-900"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,133.3C672,139,768,181,864,181.3C960,181,1056,139,1152,117.3C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
}
