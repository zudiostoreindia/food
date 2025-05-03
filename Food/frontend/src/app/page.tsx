'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FeaturedItems from '@/components/home/FeaturedItems';
import CategorySlider from '@/components/home/CategorySlider';
import HeroSection from '@/components/home/HeroSection';
import SpecialOffers from '@/components/home/SpecialOffers';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      <HeroSection />
      
      <section className="container-custom py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">Food Categories</h2>
          <p className="text-gray-600 dark:text-gray-400">Explore our delicious menu categories</p>
        </motion.div>
        
        <CategorySlider />
      </section>
      
      <section className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold mb-2">Featured Items</h2>
            <p className="text-gray-600 dark:text-gray-400">Our most popular dishes that customers love</p>
          </motion.div>
          
          <FeaturedItems />
        </div>
      </section>
      
      <section className="container-custom py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">Special Offers</h2>
          <p className="text-gray-600 dark:text-gray-400">Limited time deals you don't want to miss</p>
        </motion.div>
        
        <SpecialOffers />
      </section>
      
      <section className="bg-red-600 text-white py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-4">Download Our Mobile App</h2>
              <p className="mb-6">Get exclusive offers and track your orders in real-time with our mobile app.</p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center">
                  <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5,2H8.5A6.5,6.5,0,0,0,2,8.5v7A6.5,6.5,0,0,0,8.5,22h9A6.5,6.5,0,0,0,24,15.5v-7A6.5,6.5,0,0,0,17.5,2ZM14,15.5a1,1,0,0,1-2,0v-7a1,1,0,0,1,2,0Zm-4,0a1,1,0,0,1-2,0v-7a1,1,0,0,1,2,0Z"/>
                  </svg>
                  <div>
                    <div className="text-xs">Download on the</div>
                    <div className="text-xl font-semibold">App Store</div>
                  </div>
                </button>
                <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center">
                  <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5A0.5,0.5,0,0,1,3.5,3H20.5a0.5,0.5,0,0,1,.5.5V20.5a0.5,0.5,0,0,1-.5.5H3.5A0.5,0.5,0,0,1,3,20.5Zm2-8.5,7,4,7-4V5.5L12,9.5,5,5.5Z"/>
                  </svg>
                  <div>
                    <div className="text-xs">GET IT ON</div>
                    <div className="text-xl font-semibold">Google Play</div>
                  </div>
                </button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              <div className="relative w-64 h-96 md:w-80 md:h-[30rem]">
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/5 rounded-3xl"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold mb-2">App Screenshot</div>
                    <div className="text-sm opacity-80">Mobile app interface preview</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}
