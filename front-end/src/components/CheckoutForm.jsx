import React, { useState } from 'react';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const CheckoutForm = ({ clientSecret, amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!stripe || !elements || !clientSecret) {
      setErrorMessage('Stripe is not loaded yet.');
      return;
    }

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) {
      setErrorMessage('Card number field is not ready.');
      return;
    }

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardNumber,
        billing_details: {
          name: name || 'Client',
        },
      },
    });

    setProcessing(false);

    if (error) {
      setErrorMessage(error.message || 'Le paiement a échoué.');
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      onSuccess();
    } else {
      setErrorMessage('Le paiement n’a pas été complété.');
    }
  };

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <div className="checkout-card-wrapper">
        <div className="checkout-card-top">
          <span className="checkout-card-title">PRÉNOM NOM</span>
          <div className="checkout-card-avatar">👤</div>
        </div>

        <div className="checkout-card-body">
          <div className="stripe-card-number-field">
            <CardNumberElement options={{ style: { base: { color: '#f3f7f0', fontSize: '16px' } } }} />
          </div>

          <div className="checkout-card-row">
            <div className="checkout-card-small">
              <label>CVC</label>
              <div className="stripe-card-element stripe-card-small-element">
                <CardCvcElement options={{ style: { base: { color: '#1a1a1a', fontSize: '16px' } } }} />
              </div>
            </div>
            <div className="checkout-card-small">
              <label>MM/AA</label>
              <div className="stripe-card-element stripe-card-small-element">
                <CardExpiryElement options={{ style: { base: { color: '#1a1a1a', fontSize: '16px' } } }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && <div className="checkout-message error">{errorMessage}</div>}

      <button type="submit" className="checkout-submit-btn" disabled={processing || !stripe}>
        {processing ? 'Traitement…' : `Pay €${amount.toFixed(2)}`}
      </button>
    </form>
  );
};

export default CheckoutForm;
