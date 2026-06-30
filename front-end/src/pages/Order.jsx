import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { GROCERY_CATALOG } from '../data/groceryCatalog';
import { loadPendingCart, clearPendingCart } from '../utils/orderCart';
import CheckoutForm from '../components/CheckoutForm';
import './Order.css';

// Initialize Stripe Promise with the public key
// If VITE_STRIPE_PUBLIC_KEY is undefined, loadStripe returns null and Stripe will
// display "Unable to connect to payment provider" — check your .env file!
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.error('[MealMind] VITE_STRIPE_PUBLIC_KEY is missing from .env — Stripe will not load.');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const availableIngredients = GROCERY_CATALOG;


const Order = () => {
  const [cart, setCart] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedIngredientId, setSelectedIngredientId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [pendingPaymentIntentId, setPendingPaymentIntentId] = useState('');
  const [checkoutAmount, setCheckoutAmount] = useState(0);
  const [checkoutError, setCheckoutError] = useState('');

  const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  const remoteBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
  const apiBase = isLocalhost ? '' : remoteBase;
  const [recipeContext, setRecipeContext] = useState(null);

  // ── Auth token helper ──────────────────────────────────────────────────────
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token
      ? { Authorization: `Bearer ${token}`, 'x-auth-token': token }
      : {};
  };

  // ── Fetch order history from backend ──────────────────────────────────────
  const fetchOrderHistory = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/orders`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      });
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setRecentOrders(data);
    } catch (err) {
      console.warn('Could not load order history:', err.message);
      setRecentOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [apiBase]);


  const selectedIngredient = availableIngredients.find((ing) => ing.id === selectedIngredientId);

  // Fetch order history + pending cart on mount
  useEffect(() => {
    fetchOrderHistory();
    const pending = loadPendingCart();
    if (pending.items.length > 0) {
      setCart(pending.items);
      setRecipeContext(pending.recipeTitle);
      clearPendingCart();
    }
  }, [fetchOrderHistory]);


  const addToCart = () => {
    if (!selectedIngredient || quantity <= 0) return;

    const existingItem = cart.find((item) => item.id === selectedIngredient.id);

    if (existingItem) {
      setCart((prev) =>
        prev.map((item) =>
          item.id === selectedIngredient.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          id: selectedIngredient.id,
          name: selectedIngredient.name,
          unit: selectedIngredient.unit,
          pricePerUnit: selectedIngredient.pricePerUnit,
          imageUrl: selectedIngredient.imageUrl,
          quantity,
        },
      ]);
    }

    setQuantity(1);
    setSelectedIngredientId(null);
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);
  }, [cart]);

  const placeOrder = async () => {
    if (cart.length === 0) return;

   const MAD_TO_EUR = 0.093; // 1 DH ≈ 0.093€
const amountInEuro = Math.max(0.50, parseFloat((total * MAD_TO_EUR).toFixed(2)));
    setCheckoutError('');

    const checkoutUrl = `${apiBase}/api/stripe/create-payment-intent`;

    try {
      const response = await fetch(checkoutUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountInEuro, currency: 'eur' }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Impossible de créer le paiement.');
      }

      setClientSecret(data.clientSecret);
      setPendingPaymentIntentId(data.clientSecret?.split('_secret_')[0] || '');
      setCheckoutAmount(amountInEuro);
      setShowPaymentModal(true);

    } catch (error) {
      setCheckoutError(error.message || 'Impossible d’initier le paiement.');
    }
  };

  const finalizeOrder = async () => {
    if (cart.length === 0) return;

    const now = new Date();
    const orderId = `ORD-${now.getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;

    // Persist to backend (best-effort — don't block the UI on failure)
    try {
      await fetch(`${apiBase}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          orderId,
          items: cart,
          totalMAD: total,
          totalEUR: checkoutAmount,
          stripePaymentIntentId: pendingPaymentIntentId,
        }),
      });
    } catch (err) {
      console.warn('Order save failed (non-blocking):', err.message);
    }

    setCart([]);
    setRecipeContext(null);
    setOrderPlaced(true);
    setShowPaymentModal(false);
    setPendingPaymentIntentId('');

    // Refresh history from backend
    fetchOrderHistory();

    setTimeout(() => setOrderPlaced(false), 3000);
  };


  const handlePaymentSuccess = () => {
    finalizeOrder();
  };

  return (
    <div className="order-page">
      {showPaymentModal && (
        <div className="order-payment-modal-overlay">
          <div className="order-payment-modal">
            <div className="order-payment-modal__header">
              <div>
                <h2>Paiement de la commande</h2>
                <p className="order-payment-modal__subtitle">Finaliser votre achat en toute sécurité.</p>
              </div>
              <button
                className="order-payment-modal__close"
                onClick={() => setShowPaymentModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="order-payment-modal__content">
              <div className="order-payment-modal__summary">
                <div className="order-payment-modal__summary-header">
                  <h3>Résumé de la commande</h3>
                </div>
                <div className="order-payment-summary-card">
                  {cart.map((item) => (
                    <div key={item.id} className="order-payment-summary-item">
                      <div className="order-payment-summary-item__image">
                        <img src={item.imageUrl} alt={item.name} />
                      </div>
                      <div className="order-payment-summary-item__info">
                        <span className="order-payment-summary-item__name">{item.name}</span>
                        <span className="order-payment-summary-item__detail">{item.quantity} x {item.unit === 'L' ? 'Bouteille 500ml' : `${item.quantity} ${item.unit}`}</span>
                      </div>
                      <span className="order-payment-summary-item__price">{item.pricePerUnit * item.quantity} DH</span>
                    </div>
                  ))}
                </div>
                <div className="order-payment-rate">
                  <span>Taux de change (€/DH)</span>
                  <span className="order-payment-rate__value">Total : €{checkoutAmount.toFixed(2)} <span className="order-payment-check">✓</span></span>
                </div>
              </div>

              <Elements stripe={stripePromise}>
                <CheckoutForm
                  clientSecret={clientSecret}
                  amount={checkoutAmount}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => setShowPaymentModal(false)}
                />
              </Elements>
              {checkoutError && <div className="checkout-message error">{checkoutError}</div>}
            </div>
          </div>
        </div>
      )}

      <div className="order-page__header">
        <h1 className="cookpal-page__title">Shopping</h1>
        <p className="cookpal-page__lead">
          Select ingredients, add them to your cart, and place your order.
        </p>
      </div>

      {recipeContext && cart.length > 0 && (
        <div className="order-recipe-banner" role="status">
          Missing ingredients for <strong>{recipeContext}</strong> were added to your cart.
        </div>
      )}

      <div className="order-page__container">
        <div className="order-page__left">
          <div className="order-card">
            <h2 className="order-card__title">Available ingredients</h2>
            <div className="order-ingredients">
              {availableIngredients.map((ing) => (
                <button
                  key={ing.id}
                  className={`order-ingredient-btn ${selectedIngredientId === ing.id ? 'order-ingredient-btn--active' : ''}`}
                  onClick={() => {
                    setSelectedIngredientId(ing.id);
                    setQuantity(1);
                  }}
                >
                  <div className="order-ingredient-name">{ing.name}</div>
                  <div className="order-ingredient-price">{ing.pricePerUnit} DH/{ing.unit}</div>
                </button>
              ))}
            </div>

            {selectedIngredient && (
              <div className="order-add-section">
                <h3 className="order-add-section__title">Add to cart</h3>
                <p className="order-add-section__label">{selectedIngredient.name}</p>

                <div className="order-quantity-control">
                  <button
                    className="order-qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="order-qty-input"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                  />
                  <button className="order-qty-btn" onClick={() => setQuantity(quantity + 1)}>
                    +
                  </button>
                </div>

                <div className="order-add-price">
                  <span>Total: {selectedIngredient.pricePerUnit * quantity} DH</span>
                </div>

                <button className="order-add-btn" onClick={addToCart}>
                  Add to cart
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="order-page__right">
          <div className="order-card">
            <h2 className="order-card__title">Shopping cart</h2>

            {cart.length === 0 ? (
              <div className="order-empty">
                <p>Your cart is empty</p>
                <p className="order-empty__hint">
                  Pick a recipe from Scanner or Recipes and order missing ingredients.
                </p>
              </div>
            ) : (
              <>
                <div className="order-cart-items">
                  {cart.map((item) => (
                    <div key={item.id} className="order-cart-item">
                      <div className="order-cart-item__info">
                        <p className="order-cart-item__name">{item.name}</p>
                        {item.fromRecipe && (
                          <p className="order-cart-item__recipe">For: {item.fromRecipe}</p>
                        )}
                        <p className="order-cart-item__price">{item.pricePerUnit} DH/{item.unit}</p>
                      </div>

                      <div className="order-cart-item__quantity">
                        <button
                          className="order-qty-mini"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          className="order-qty-mini"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <div className="order-cart-item__total">
                        <p>{item.pricePerUnit * item.quantity} DH</p>
                        <button
                          className="order-remove-btn"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-divider" />

                <div className="order-total">
                  <span>Total</span>
                  <span className="order-total__amount">{total} DH</span>
                </div>

                <button className="order-place-btn" onClick={placeOrder}>
                  Place order
                </button>

                {checkoutError && <div className="checkout-message error" style={{ marginTop: '16px' }}>{checkoutError}</div>}

                {orderPlaced && <div className="order-success">Order placed successfully</div>}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="order-history">
        <div className="order-card">
          <h2 className="order-card__title">Order history</h2>
          {ordersLoading ? (
            <div className="order-history__loading">
              <span className="order-history__spinner" />
              Loading orders…
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="order-history__empty">No orders yet — place your first order above!</p>
          ) : (
            <div className="order-history__list">
              {recentOrders.map((order) => {
                const date = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString('en-GB')
                  : order.date || '—';
                const itemCount = order.items?.length ?? 0;
                return (
                  <div key={order._id || order.orderId} className="order-history__item">
                    <div className="order-history__item-left">
                      <span className="order-history__id">{order.orderId || order.id}</span>
                      <span className="order-history__meta">
                        {itemCount} item{itemCount !== 1 ? 's' : ''} · {date}
                      </span>
                    </div>
                    <div className="order-history__item-right">
                      <span className="order-history__total">{order.totalMAD ?? order.total} DH</span>
                      {order.totalEUR != null && (
                        <span className="order-history__eur">€{Number(order.totalEUR).toFixed(2)}</span>
                      )}
                      <span className="order-history__badge order-history__badge--paid">Paid</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Order;
