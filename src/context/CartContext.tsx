'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface CartProduct {
  id: string;
  name: string;
  price: number;
  variants: any[];
  originalPrice?: number;
  images: string[];
  category: string;
}

export interface CartItemType {
  id: string;
  quantity: number;
  size: string;
  color: string;
  material?: string;
  product: CartProduct | null;
  project_id?: string;
}

interface CartContextType {
  items: CartItemType[];
  itemCount: number;
  total: number;
  isOpen: boolean;
  loading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (productId: string, size: string, color: string, quantity?: number, material?: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api'
    : 'http://localhost:5000/api');

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItemType[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  // Fetch cart on login
  const fetchCart = useCallback(async () => {
    if (!token) {
      setItems([]);
      setItemCount(0);
      setTotal(0);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/cart`, { headers: headers() });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setItemCount(data.itemCount);
        setTotal(data.total);
      }
    } catch {
      // silently fail
    }
  }, [token, headers]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addToCart = async (productId: string, size: string, color: string, quantity = 1, material?: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ product_id: productId, size, color, material, quantity }),
      });
      if (res.ok) {
        await fetchCart();
        setIsOpen(true);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id: string) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/cart/${id}`, { method: 'DELETE', headers: headers() });
      await fetchCart();
    } catch {
      // silently fail
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/cart/${id}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ quantity }),
      });
      await fetchCart();
    } catch {
      // silently fail
    }
  };

  const clearCart = () => {
    setItems([]);
    setItemCount(0);
    setTotal(0);
  };

  return (
    <CartContext.Provider value={{ items, itemCount, total, isOpen, loading, openCart, closeCart, addToCart, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
