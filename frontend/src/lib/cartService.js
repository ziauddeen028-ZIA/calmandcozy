import axios from 'axios';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';
const API_URL = `${STRAPI_URL}/api`;

const getHeaders = (supabaseId) => ({
  'Content-Type': 'application/json',
  'X-Supabase-Id': supabaseId,
});

export const fetchCart = async (supabaseId) => {
  try {
    const response = await axios.get(`${API_URL}/carts`, {
      headers: getHeaders(supabaseId),
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

export const addToCart = async (supabaseId, productDocumentId, quantity = 1, customization = {}) => {
  try {
    const response = await axios.post(
      `${API_URL}/carts`,
      {
        data: {
          product: productDocumentId,
          quantity: quantity,
          ...customization
        },
      },
      { headers: getHeaders(supabaseId) }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartQuantity = async (supabaseId, cartDocumentId, quantity) => {
  try {
    const response = await axios.put(
      `${API_URL}/carts/${cartDocumentId}`,
      {
        data: {
          quantity: quantity,
        },
      },
      { headers: getHeaders(supabaseId) }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    throw error;
  }
};

export const removeFromCart = async (supabaseId, cartDocumentId) => {
  try {
    const response = await axios.delete(`${API_URL}/carts/${cartDocumentId}`, {
      headers: getHeaders(supabaseId),
    });
    return response.data.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const clearCart = async (supabaseId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/cart-clear`,
      {
        headers: getHeaders(supabaseId),
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};
