'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ClockIcon, TagIcon } from '@heroicons/react/24/outline';

// Mock data for special offers
const specialOffers = [
  {
    id: 1,
    title: 'Family Feast',
    description: 'Perfect for 4 people: 2 large pizzas, 4 sides, and 2 desserts',
    discount: '25% OFF',
    originalPrice: 59.99,
    discountedPrice: 44.99,
    image: '/family-feast.jpg',
    validUntil: '2025-06-15',
    code: 'FAMILY25',
  },
  {
    id: 2,
    title: 'Lunch Special',
    description: 'Any main course with a side and drink, available weekdays 11am-3pm',
    discount: '20% OFF',
    originalPrice: 24.99,
    discountedPrice: 19.99,
    image: '/lunch-special.jpg',
    validUntil: '2025-05-31',
    code: 'LUNCH20',
  },
  {
    id: 3,
    title: 'Weekend Brunch',
    description: 'Enjoy our special brunch menu with complimentary mimosa',
    discount: '15% OFF',
    originalPrice: 29.99,
    discountedPrice: 25.49,
    image: '/weekend-brunch.jpg',
    validUntil: '2025-06-30',
    code: 'BRUNCH15',
  },
];

export default function SpecialOffers() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {specialOffers.map((offer, index) => (
        <motion.div
          key={offer.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="card relative overflow-hidden group"
        >
          {/* Discount Badge */}
          <div className="absolute top-4 left-0 bg-red-600 text-white py-1 px-4 font-bold rounded-r-lg shadow-md z-10">
            {offer.discount}
          </div>
          
          {/* Offer Image */}
          <div className="h-48 bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center overflow-hidden">
            <span className="text-white font-bold">Offer Image</span>
          </div>
          
          {/* Offer Details */}
          <div className="p-5">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{offer.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{offer.description}</p>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <ClockIcon className="h-5 w-5 mr-1" />
                <span className="text-sm">Valid until {new Date(offer.validUntil).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 dark:text-gray-500 line-through text-sm mr-2">${offer.originalPrice.toFixed(2)}</span>
                <span className="text-red-600 font-bold">${offer.discountedPrice.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Promo Code */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex justify-between items-center mb-4">
              <div className="flex items-center">
                <TagIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                <span className="font-mono font-semibold">{offer.code}</span>
              </div>
              <button
                onClick={() => copyToClipboard(offer.code)}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 font-medium"
              >
                {copiedCode === offer.code ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <Link href={`/offers/${offer.id}`}>
              <button className="w-full btn-outline">
                View Details
              </button>
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
