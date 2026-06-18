const CART_KEY = 'mealmind-pending-cart';

export function savePendingCart(cartItems, meta = {}) {
  localStorage.setItem(
    CART_KEY,
    JSON.stringify({
      items: cartItems,
      recipeTitle: meta.recipeTitle || null,
      savedAt: Date.now(),
    })
  );
  window.dispatchEvent(new CustomEvent('mealmind-cart-updated'));
}

export function loadPendingCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return { items: [], recipeTitle: null };
    const parsed = JSON.parse(raw);
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      recipeTitle: parsed.recipeTitle || null,
    };
  } catch {
    return { items: [], recipeTitle: null };
  }
}

export function clearPendingCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new CustomEvent('mealmind-cart-updated'));
}
