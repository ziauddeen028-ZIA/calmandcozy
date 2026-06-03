import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { 
  fetchCart, 
  addToCart as apiAddToCart, 
  updateCartQuantity as apiUpdateCartQuantity, 
  removeFromCart as apiRemoveFromCart, 
  clearCart as apiClearCart 
} from '../lib/cartService';
import toast from 'react-hot-toast';

const CartContext = createContext({});

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCart = useCallback(async () => {
    if (!user?.id) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchCart(user.id);
      setCartItems(data || []);
    } catch (error) {
      console.error('Failed to load cart', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = async (productDocumentId, quantity = 1, customization = {}) => {
    if (!user) {
      toast.error('Please login first');
      return false;
    }

    try {
      await apiAddToCart(user.id, productDocumentId, quantity, customization);
      await loadCart();
      toast.success('Added to Cart 🛒', { duration: 1500 });
      return true;
    } catch (error) {
      toast.error('Failed to add to cart');
      return false;
    }
  };

  const updateQuantity = async (cartDocumentId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      // Optimistic update
      setCartItems(prev => prev.map(item => 
        item.documentId === cartDocumentId ? { ...item, quantity: newQuantity } : item
      ));

      await apiUpdateCartQuantity(user.id, cartDocumentId, newQuantity);
    } catch (error) {
      toast.error('Failed to update quantity');
      // Revert on failure
      await loadCart();
    }
  };

  const removeFromCart = async (cartDocumentId) => {
    try {
      await apiRemoveFromCart(user.id, cartDocumentId);
      setCartItems(prev => prev.filter(item => item.documentId !== cartDocumentId));
      toast.success('Removed from Cart', { duration: 1500 });
      return true;
    } catch (error) {
      toast.error('Failed to remove item');
      return false;
    }
  };

  const clearCart = async () => {
    try {
      await apiClearCart(user.id);
      setCartItems([]);
      toast.success('Cart cleared', { duration: 1500 });
      return true;
    } catch (error) {
      toast.error('Failed to clear cart');
      return false;
    }
  };

  const cartTotalItems = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  }, [cartItems]);

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.sellingPrice || item.product?.price || 0;
      return total + (price * (item.quantity || 1));
    }, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartTotalItems,
      cartSubtotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
