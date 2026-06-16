import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  fetchCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateCartQuantity,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart
} from '../lib/cartService';
import { calculateCartTotals } from '../lib/pricingUtils';
import toast from 'react-hot-toast';

const CartContext = createContext({});

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track pending add operations so the navbar badge reflects them instantly.
  const [pendingAddCount, setPendingAddCount] = useState(0);

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

  // ─── addToCart ────────────────────────────────────────────────
  // Optimistically bumps the pending count so the badge updates instantly.
  // API fires in background. Returns immediately.
  const addToCart = (productDocumentId, quantity = 1, customization = {}) => {
    if (!user) {
      toast('Please sign in to continue.', { icon: '🔒' });
      navigate('/login');
      return false;
    }

    // Optimistic: increment badge immediately
    setPendingAddCount((n) => n + quantity);
    toast.success('Added to Cart 🛒', { duration: 1500 });

    // Background API call
    (async () => {
      try {
        await apiAddToCart(user.id, productDocumentId, quantity, customization);
      } catch (error) {
        // Revert pending count on failure
        setPendingAddCount((n) => n - quantity);
        toast.error('Failed to add to cart');
      } finally {
        await loadCart();
        setPendingAddCount(0);
      }
    })();

    return true;
  };

  // ─── updateQuantity ───────────────────────────────────────────
  // Already optimistic: update local state first, revert on API failure.
  const updateQuantity = async (cartDocumentId, newQuantity) => {
    if (newQuantity < 1) return;

    const previous = cartItems;
    setCartItems((prev) =>
      prev.map((item) =>
        item.documentId === cartDocumentId ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      await apiUpdateCartQuantity(user.id, cartDocumentId, newQuantity);
    } catch (error) {
      toast.error('Failed to update quantity');
      setCartItems(previous); // revert
    }
  };

  // ─── removeFromCart ───────────────────────────────────────────
  // Optimistically removes the item; restores it if the API call fails.
  const removeFromCart = async (cartDocumentId) => {
    const previous = cartItems;
    setCartItems((prev) => prev.filter((item) => item.documentId !== cartDocumentId));
    toast.success('Removed from Cart', { duration: 1500 });

    try {
      await apiRemoveFromCart(user.id, cartDocumentId);
      return true;
    } catch (error) {
      toast.error('Failed to remove item');
      setCartItems(previous); // revert
      return false;
    }
  };

  // ─── clearCart ────────────────────────────────────────────────
  // Optimistically clears the list; restores it if the API call fails.
  const clearCart = async () => {
    const previous = cartItems;
    setCartItems([]);
    toast.success('Cart cleared', { duration: 1500 });

    try {
      await apiClearCart(user.id);
      return true;
    } catch (error) {
      toast.error('Failed to clear cart');
      setCartItems(previous); // revert
      return false;
    }
  };

  const cartTotalItems = useMemo(() => {
    const real = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
    return real + pendingAddCount;
  }, [cartItems, pendingAddCount]);

  const cartTotals = useMemo(() => {
    return calculateCartTotals(cartItems);
  }, [cartItems]);

  const cartSubtotal   = cartTotals.finalSubtotal;
  const rawSubtotal    = cartTotals.rawSubtotal;
  const totalSavings   = cartTotals.totalSavings;
  const bundleMessages = cartTotals.bundleMessages;
  const appliedBundles = cartTotals.appliedBundles;

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartTotalItems,
      cartSubtotal,
      rawSubtotal,
      totalSavings,
      bundleMessages,
      appliedBundles
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
