'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';

type FoodItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
};

type CartItem = {
  item: FoodItem;
  quantity: number;
  specialInstructions?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: FoodItem, quantity?: number, specialInstructions?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateSpecialInstructions: (itemId: string, instructions: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  orderType: 'delivery' | 'takeout' | 'dine-in';
  setOrderType: (type: 'delivery' | 'takeout' | 'dine-in') => void;
  tableNumber: number | null;
  setTableNumber: (tableNumber: number | null) => void;
  deliveryAddress: DeliveryAddress | null;
  setDeliveryAddress: (address: DeliveryAddress | null) => void;
};

type DeliveryAddress = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Load cart from localStorage on initial render
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<'delivery' | 'takeout' | 'dine-in'>('delivery');
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  
  // Tax rate and delivery fee (could be loaded from environment or API)
  const TAX_RATE = 0.1; // 10%
  const DELIVERY_FEE = orderType === 'delivery' ? 5 : 0;
  
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    const storedOrderType = localStorage.getItem('orderType');
    const storedTableNumber = localStorage.getItem('tableNumber');
    const storedDeliveryAddress = localStorage.getItem('deliveryAddress');
    
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }
    
    if (storedOrderType) {
      setOrderType(JSON.parse(storedOrderType));
    }
    
    if (storedTableNumber) {
      setTableNumber(JSON.parse(storedTableNumber));
    }
    
    if (storedDeliveryAddress) {
      setDeliveryAddress(JSON.parse(storedDeliveryAddress));
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);
  
  useEffect(() => {
    localStorage.setItem('orderType', JSON.stringify(orderType));
  }, [orderType]);
  
  useEffect(() => {
    localStorage.setItem('tableNumber', JSON.stringify(tableNumber));
  }, [tableNumber]);
  
  useEffect(() => {
    localStorage.setItem('deliveryAddress', JSON.stringify(deliveryAddress));
  }, [deliveryAddress]);
  
  // Calculate cart totals
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + (item.item.price * item.quantity), 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + DELIVERY_FEE;
  
  const addItem = (item: FoodItem, quantity = 1, specialInstructions = '') => {
    setItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(cartItem => cartItem.item.id === item.id);
      
      if (existingItemIndex !== -1) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        
        // Update special instructions if provided
        if (specialInstructions) {
          updatedItems[existingItemIndex].specialInstructions = specialInstructions;
        }
        
        return updatedItems;
      } else {
        // Item doesn't exist, add new item
        return [...prevItems, { item, quantity, specialInstructions }];
      }
    });
  };
  
  const removeItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.item.id !== itemId));
  };
  
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.item.id === itemId ? { ...item, quantity } : item
      )
    );
  };
  
  const updateSpecialInstructions = (itemId: string, instructions: string) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.item.id === itemId ? { ...item, specialInstructions: instructions } : item
      )
    );
  };
  
  const clearCart = () => {
    setItems([]);
    setTableNumber(null);
    setDeliveryAddress(null);
  };
  
  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateSpecialInstructions,
        clearCart,
        itemCount,
        subtotal,
        tax,
        deliveryFee: DELIVERY_FEE,
        total,
        orderType,
        setOrderType,
        tableNumber,
        setTableNumber,
        deliveryAddress,
        setDeliveryAddress
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
