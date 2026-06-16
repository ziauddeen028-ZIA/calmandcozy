import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  fetchWishlist,
  addToWishlist as apiAddToWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
} from '../lib/wishlistService';
import toast from 'react-hot-toast';

const WishlistContext = createContext({});

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = useCallback(async () => {
    if (!user?.id) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchWishlist(user.id);
      setWishlist(data || []);
    } catch (error) {
      console.error('Failed to load wishlist', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // ─── handleToggleWishlist ──────────────────────────────────────
  const handleToggleWishlist = (productDocumentId) => {
    if (!user) {
      toast('Please sign in to continue.', { icon: '🔒' });
      navigate('/login');
      return false;
    }

    const existingItem = wishlist.find(
      (item) => item.product?.documentId === productDocumentId
    );

    // ── REMOVE (optimistic) ──────────────────────────────────────
    if (existingItem) {
      const previous = wishlist;

      setWishlist((prev) =>
        prev.filter((item) => item.documentId !== existingItem.documentId)
      );
      toast.success('Removed from Wishlist 💔', { duration: 1000 });

      (async () => {
        try {
          await apiRemoveFromWishlist(user.id, existingItem.documentId);
        } catch (err) {
          toast.error('Failed to remove from wishlist');
          setWishlist(previous);
        }
      })();
      return true;
    }

    // ── ADD (optimistic) ─────────────────────────────────────────
    const tempId = `__temp_${productDocumentId}`;
    const tempItem = {
      documentId: tempId,
      product: { documentId: productDocumentId },
    };

    setWishlist((prev) => [...prev, tempItem]);
    toast.success('Added to Wishlist ❤️', { duration: 1000 });

    (async () => {
      try {
        const newItem = await apiAddToWishlist(user.id, productDocumentId);
        setWishlist((prev) =>
          prev.map((item) => (item.documentId === tempId ? newItem : item))
        );
      } catch (err) {
        if (err.message === 'Already in wishlist') {
          toast('Already in Wishlist', { icon: '❤️', duration: 1000 });
          await loadWishlist();
        } else {
          toast.error('Failed to add to wishlist');
          setWishlist((prev) => prev.filter((item) => item.documentId !== tempId));
        }
      }
    })();
    return true;
  };

  // ─── removeFromWishlist (used on dedicated Wishlist page) ──────
  const removeFromWishlist = async (wishlistDocumentId) => {
    const previous = wishlist;

    // Optimistic remove
    setWishlist((prev) => prev.filter((item) => item.documentId !== wishlistDocumentId));
    toast.success('Removed from Wishlist 💔', { duration: 1000 });

    try {
      await apiRemoveFromWishlist(user.id, wishlistDocumentId);
      return true;
    } catch (error) {
      toast.error('Failed to remove item');
      setWishlist(previous); // revert
      return false;
    }
  };

  const isInWishlist = (productDocumentId) =>
    wishlist.some((item) => item.product?.documentId === productDocumentId);

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        handleToggleWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
