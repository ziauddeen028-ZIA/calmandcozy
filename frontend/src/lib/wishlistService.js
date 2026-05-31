const STRAPI_URL =
    import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

const STRAPI_API_TOKEN =
    import.meta.env.VITE_STRAPI_API_TOKEN;

function getHeaders(supabaseId) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (STRAPI_API_TOKEN) {
        headers.Authorization = `Bearer ${STRAPI_API_TOKEN}`;
    }

    if (supabaseId) {
        headers['X-Supabase-Id'] = supabaseId;
    }

    return headers;
}

/**
 * Fetch wishlist items
 */
export async function fetchWishlist(supabaseId) {
    console.log('[Wishlist] Fetch Started');

    const res = await fetch(
        `${STRAPI_URL}/api/wishlists`,
        {
            headers: getHeaders(supabaseId),
        }
    );

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));

        console.error('[Wishlist] Error:', err);

        throw new Error(
            err?.error?.message ||
            `Fetch failed: ${res.status}`
        );
    }

    const data = await res.json();

    console.log(
        '[Wishlist] Fetch Success —',
        data.data?.length ?? 0,
        'item(s)'
    );

    return data.data || [];
}

/**
 * Add product to wishlist
 */
export async function addToWishlist(
    supabaseId,
    productId
) {
    console.log(
        '[Wishlist] Add Started — product:',
        productId
    );

    const res = await fetch(
        `${STRAPI_URL}/api/wishlists`,
        {
            method: 'POST',
            headers: getHeaders(supabaseId),
            body: JSON.stringify({
                data: {
                    product: productId,
                },
            }),
        }
    );

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));

        console.error('[Wishlist] Error:', err);

        throw new Error(
            err?.error?.message ||
            `Add failed: ${res.status}`
        );
    }

    const data = await res.json();

    console.log(
        '[Wishlist] Add Success'
    );

    return data.data;
}

/**
 * Remove wishlist item
 */
export async function removeFromWishlist(
    supabaseId,
    documentId
) {
    console.log(
        '[Wishlist] Remove Started —',
        documentId
    );

    const res = await fetch(
        `${STRAPI_URL}/api/wishlists/${documentId}`,
        {
            method: 'DELETE',
            headers: getHeaders(supabaseId),
        }
    );

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));

        console.error('[Wishlist] Error:', err);

        throw new Error(
            err?.error?.message ||
            `Delete failed: ${res.status}`
        );
    }

    console.log(
        '[Wishlist] Remove Success —',
        documentId
    );

    return true;
}
