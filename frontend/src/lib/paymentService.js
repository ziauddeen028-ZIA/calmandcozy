const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = import.meta.env.VITE_STRAPI_API_TOKEN;

function getHeaders(supabaseId) {
  const headers = { 'Content-Type': 'application/json' };
  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  }
  if (supabaseId) {
    headers['X-Supabase-Id'] = supabaseId;
  }
  return headers;
}

/**
 * Creates a Razorpay order from the backend.
 * @param {string} supabaseId - The Supabase user ID.
 * @param {number} amount - The amount to charge.
 * @returns {Promise<Object>} The Razorpay order details.
 */
export async function createPaymentOrder(supabaseId, amount) {
  const res = await fetch(`${STRAPI_URL}/api/payment/create-order`, {
    method: 'POST',
    headers: getHeaders(supabaseId),
    body: JSON.stringify({ amount }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to create payment order: ${res.status}`);
  }

  return res.json();
}
