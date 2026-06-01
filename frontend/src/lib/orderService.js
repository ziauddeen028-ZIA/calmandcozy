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
 * Fetch all orders for a customer.
 * @param {string} supabaseId - The Supabase user ID.
 * @returns {Promise<Array>} Array of order objects.
 */
export async function fetchOrders(supabaseId) {
  console.log('[Order] Fetch Started');
  // Add populate=* to get order items
  const res = await fetch(`${STRAPI_URL}/api/orders?filters[supabaseId][$eq]=${supabaseId}&populate=*&sort=createdAt:desc`, {
    headers: getHeaders(supabaseId),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('[Order] Fetch Error:', err);
    throw new Error(err?.error?.message || `Fetch failed: ${res.status}`);
  }

  const data = await res.json();
  console.log('[Order] Fetch Success —', data.data?.length ?? 0, 'order(s)');
  return data.data || [];
}

/**
 * Fetch a single order by documentId.
 * @param {string} supabaseId - The Supabase user ID.
 * @param {string} documentId - The Strapi documentId for the order.
 * @returns {Promise<Object>} Order object.
 */
export async function fetchOrderById(supabaseId, documentId) {
  console.log('[Order] Fetch By Id Started:', documentId);
  const res = await fetch(`${STRAPI_URL}/api/orders/${documentId}?populate=*`, {
    headers: getHeaders(supabaseId),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('[Order] Fetch By Id Error:', err);
    throw new Error(err?.error?.message || `Fetch failed: ${res.status}`);
  }

  const data = await res.json();
  // Ensure the order belongs to this user
  if (data.data?.supabaseId !== supabaseId) {
    throw new Error("Unauthorized access to order");
  }
  
  return data.data;
}

/**
 * Create a new order.
 * @param {string} supabaseId - The Supabase user ID.
 * @param {Object} orderData - Order fields.
 * @returns {Promise<Object>} Created order.
 */
export async function createOrder(supabaseId, orderData) {
  console.log('[Order] Create Started');
  const res = await fetch(`${STRAPI_URL}/api/orders`, {
    method: 'POST',
    headers: getHeaders(supabaseId),
    body: JSON.stringify({ data: { ...orderData, supabaseId } }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('[Order] Create Error:', err);
    throw new Error(err?.error?.message || `Create failed: ${res.status}`);
  }

  const data = await res.json();
  console.log('[Order] Create Success — id:', data.data?.id);
  return data.data;
}
