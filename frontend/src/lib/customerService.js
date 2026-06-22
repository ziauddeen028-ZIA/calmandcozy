/**
 * customerService.js
 * Handles all Strapi Customer API interactions.
 * Provides find and create operations keyed by supabase_id.
 */

const API_URL = import.meta.env.VITE_API_URL;
const STRAPI_API_TOKEN = import.meta.env.VITE_STRAPI_API_TOKEN;

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  }
  return headers;
}

/**
 * Fetch a customer from Strapi by their Supabase user ID.
 * Returns the customer object or null if not found.
 */
export async function fetchCustomerBySupabaseId(supabaseId) {
  const res = await fetch(
    `${API_URL}/api/customers?filters[supabase_id][$eq]=${encodeURIComponent(supabaseId)}`,
    { headers: getHeaders() }
  );

  if (!res.ok) {
    throw new Error(`Strapi fetch failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (data.data && data.data.length > 0) {
    return data.data[0];
  }
  return null;
}

/**
 * Create a new customer record in Strapi.
 * Returns the created customer object.
 */
export async function createCustomer({ full_name, email, supabase_id, avatar_letter, phone }) {
  const res = await fetch(`${API_URL}/api/customers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      data: { full_name, email, supabase_id, avatar_letter, phone },
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    // Handle duplicate (422 Unprocessable Entity or 400)
    if (res.status === 400 || res.status === 422) {
      // Customer already exists — fetch it instead
      const existing = await fetchCustomerBySupabaseId(supabase_id);
      if (existing) return existing;
    }
    throw new Error(
      errData?.error?.message || `Strapi create failed: ${res.status} ${res.statusText}`
    );
  }

  const data = await res.json();
  return data.data;
}

/**
 * Sync a Supabase user to Strapi:
 * - If a customer with this supabase_id already exists, return it.
 * - Otherwise, create a new customer.
 * Returns the customer object or null on failure.
 */
export async function syncCustomer(supabaseUser) {
  if (!supabaseUser) return null;

  const fullName = supabaseUser.user_metadata?.full_name || 'User';
  const avatarLetter = fullName.charAt(0).toUpperCase();

  // 1. Check if customer already exists
  const existing = await fetchCustomerBySupabaseId(supabaseUser.id);
  if (existing) return existing;

  // 2. Create new customer
  return await createCustomer({
    full_name: fullName,
    email: supabaseUser.email,
    supabase_id: supabaseUser.id,
    avatar_letter: avatarLetter,
    phone: supabaseUser.user_metadata?.phone,
  });
}
