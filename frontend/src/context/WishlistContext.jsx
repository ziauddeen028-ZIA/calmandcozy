import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { fetchWishlist, addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist } from '../lib/wishlistService';
import toast from 'react-hot-toast';

const WishlistContext = createContext({});

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
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

const handleToggleWishlist = async (productDocumentId) => {
  if (!user) {
    toast.error('Please login first');
    return false;
  }

  const existingItem = wishlist.find(
    item => item.product?.documentId === productDocumentId
  );

  if (existingItem) {
    try {
      await apiRemoveFromWishlist(
        user.id,
        existingItem.documentId
      );

      setWishlist(prev =>
        prev.filter(
          item =>
            item.documentId !== existingItem.documentId
        )
      );

      toast.success('Removed from Wishlist 💔', {
        duration: 1000,
      });

      return true;
    } catch (err) {
      toast.error('Failed to remove from wishlist');
      return false;
    }
  } else {
    try {
      const newItem = await apiAddToWishlist(
        user.id,
        productDocumentId
      );

      // Use the POST response directly to avoid a redundant GET request
      if (newItem) {
        setWishlist(prev => [...prev, newItem]);
      }

      toast.success('Added to Wishlist ❤️', {
        duration: 1000,
      });

      return true;
    } catch (err) {
      if (err.message === 'Already in wishlist') {
        toast('Already in Wishlist', {
          icon: '❤️',
          duration: 1000,
        });
        return true;
      }

      toast.error('Failed to add to wishlist');
      return false;
    }
  }
};

  const removeFromWishlist = async (wishlistDocumentId) => {
    try {
      await apiRemoveFromWishlist(user.id, wishlistDocumentId);
      setWishlist((prev) => prev.filter((item) => item.documentId !== wishlistDocumentId));
      toast.success('Removed from Wishlist 💔', { duration: 1000 });
      return true;
    } catch (error) {
      toast.error('Failed to remove item');
      return false;
    }
  };

  const isInWishlist = (productDocumentId) => {
    return wishlist.some(item => item.product?.documentId === productDocumentId);
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{
      wishlist,
      loading,
      handleToggleWishlist,
      removeFromWishlist,
      isInWishlist,
      wishlistCount
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
