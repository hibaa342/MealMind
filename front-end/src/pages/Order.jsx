import React, { useState, useMemo } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import './Order.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const availableIngredients = [
  {
    id: 1,
    name: 'Tomatoes',
    unit: 'kg',
    pricePerUnit: 18,
    imageUrl: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 2,
    name: 'Chicken',
    unit: 'kg',
    pricePerUnit: 120,
    imageUrl: 'https://images.unsplash.com/photo-1604908553944-590218fb0d3d?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 3,
    name: 'Cheese',
    unit: 'kg',
    pricePerUnit: 95,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 4,
    name: 'Olive oil',
    unit: 'L',
    pricePerUnit: 45,
    imageUrl: 'https://images.unsplash.com/photo-1516684669134-de6d6d4ab358?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 5,
    name: 'Bread',
    unit: 'piece',
    pricePerUnit: 5,
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 6,
    name: 'Eggs',
    unit: 'dozen',
    pricePerUnit: 22,
    imageUrl: 'https://images.unsplash.com/photo-1518976024611-4885b8f5d9d4?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 7,
    name: 'Milk',
    unit: 'L',
    pricePerUnit: 12,
    imageUrl: 'https://images.unsplash.com/photo-1547434216-3f0a7ed77fed?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 8,
    name: 'Onions',
    unit: 'kg',
    pricePerUnit: 8,
    imageUrl: 'https://images.unsplash.com/photo-1615938385898-048d1f8a999b?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 9,
    name: 'Garlic',
    unit: 'kg',
    pricePerUnit: 15,
    imageUrl: 'https://images.unsplash.com/photo-1516893842207-4417f1eea264?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 10,
    name: 'Rice',
    unit: 'kg',
    pricePerUnit: 25,
    imageUrl: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=120&q=80',
  },
];

const recentOrdersSeed = [
  { id: 'ORD-2026-102', date: '24/05/2026', total: 132 },
  { id: 'ORD-2026-097', date: '18/05/2026', total: 168 },
  { id: 'ORD-2026-091', date: '10/05/2026', total: 96 },
];

const Order = () => {
  const [cart, setCart] = useState([]);
  const [recentOrders, setRecentOrders] = useState(recentOrdersSeed);
  const [selectedIngredientId, setSelectedIngredientId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [checkoutAmount, setCheckoutAmount] = useState(0);
  const [checkoutError, setCheckoutError] = useState('');

  const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  const apiBase = isLocalhost
    ? '/api'
    : import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '/api';

  const selectedIngredient = availableIngredients.find((ing) => ing.id === selectedIngredientId);

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

    const checkoutUrl = isLocalhost
      ? '/api/stripe/create-payment-intent'
      : `${apiBase}/api/stripe/create-payment-intent`;

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
      setCheckoutAmount(amountInEuro);
      setShowPaymentModal(true);
    } catch (error) {
      setCheckoutError(error.message || 'Impossible d’initier le paiement.');
    }
  };

  const finalizeOrder = () => {
    if (cart.length === 0) return;

    const now = new Date();
    const orderId = `ORD-${now.getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
    const orderDate = now.toLocaleDateString('en-GB');

    const newOrder = {
      id: orderId,
      date: orderDate,
      total,
    };

    setRecentOrders((prev) => [newOrder, ...prev].slice(0, 5));
    setCart([]);
    setOrderPlaced(true);
    setShowPaymentModal(false);

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
                <p className="order-empty__hint">Select ingredients from the list to add them</p>
              </div>
            ) : (
              <>
                <div className="order-cart-items">
                  {cart.map((item) => (
                    <div key={item.id} className="order-cart-item">
                      <div className="order-cart-item__info">
                        <p className="order-cart-item__name">{item.name}</p>
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
          {recentOrders.length === 0 ? (
            <p className="order-history__empty">No orders yet</p>
          ) : (
            <div className="order-history__list">
              {recentOrders.map((order) => (
                <div key={order.id} className="order-history__item">
                  <div className="order-history__id">{order.id}</div>
                  <div className="order-history__date">{order.date}</div>
                  <div className="order-history__total">{order.total} DH</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Order;
