'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingCartIcon, UserIcon, MoonIcon, SunIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeContext();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Menu', href: '/menu' },
    { name: 'Offers', href: '/offers' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white dark:bg-gray-900 shadow-md py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-red-600">Food<span className="text-orange-500">Order</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`font-medium transition-colors duration-200 ${
                  pathname === link.href
                    ? 'text-red-600 dark:text-red-500'
                    : 'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <SunIcon className="h-6 w-6 text-gray-300" />
              ) : (
                <MoonIcon className="h-6 w-6 text-gray-700" />
              )}
            </button>
            
            <Link
              href="/cart"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 relative"
            >
              <ShoppingCartIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              <span className="absolute top-0 right-0 h-5 w-5 bg-red-600 rounded-full flex items-center justify-center text-white text-xs">
                0
              </span>
            </Link>
            
            <Link
              href="/account"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <UserIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            <Link
              href="/cart"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 relative"
            >
              <ShoppingCartIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              <span className="absolute top-0 right-0 h-5 w-5 bg-red-600 rounded-full flex items-center justify-center text-white text-xs">
                0
              </span>
            </Link>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 relative"
          >
            <input
              type="text"
              placeholder="Search for food..."
              className="w-full p-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </motion.div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white dark:bg-gray-900 shadow-lg"
        >
          <div className="container-custom py-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-medium transition-colors duration-200 ${
                    pathname === link.href
                      ? 'text-red-600 dark:text-red-500'
                      : 'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="pt-2 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300"
                >
                  {theme === 'dark' ? (
                    <>
                      <SunIcon className="h-5 w-5" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <MoonIcon className="h-5 w-5" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
                
                <Link
                  href="/account"
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Account</span>
                </Link>
              </div>
            </nav>
          </div>
        </motion.div>
      )}
    </header>
  );
}
