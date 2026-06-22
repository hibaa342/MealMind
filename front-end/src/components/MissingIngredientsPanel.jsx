import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMissingIngredients } from '../api/missingIngredients';
import { getScannedIngredients } from '../utils/scannedIngredients';
import { mapIngredientToCatalog } from '../data/groceryCatalog';
import { savePendingCart } from '../utils/orderCart';
import './MissingIngredientsPanel.css';

export default function MissingIngredientsPanel({
  mealId,
  recipeDetail,
  recipeTitle,
  fridgeIngredients: fridgeProp,
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [missing, setMissing] = useState([]);
  const [have, setHave] = useState([]);

  const fridgeIngredients = fridgeProp?.length ? fridgeProp : getScannedIngredients();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!recipeDetail && !mealId) return;

      if (fridgeIngredients.length === 0) {
        setLoading(false);
        setError('Scan your fridge first so we can compare ingredients.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await fetchMissingIngredients({
          mealId,
          recipeDetail,
          fridgeIngredients,
        });
        if (cancelled) return;
        setMissing(data.missing || []);
        setHave(data.have || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Comparison failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [mealId, recipeDetail, fridgeIngredients.join('|')]);

  const orderableMissing = missing
    .map((item) => {
      const catalog = mapIngredientToCatalog(item.name);
      return catalog ? { ...item, catalog } : { ...item, catalog: null };
    })
    .filter((item) => item.catalog);

  const unlistedMissing = missing.filter((item) => !mapIngredientToCatalog(item.name));

  const handleOrderMissing = () => {
    if (orderableMissing.length === 0) return;

    const cartItems = orderableMissing.map((item) => ({
      id: item.catalog.id,
      name: item.catalog.name,
      unit: item.catalog.unit,
      pricePerUnit: item.catalog.pricePerUnit,
      quantity: 1,
      fromRecipe: item.name,
    }));

    savePendingCart(cartItems, { recipeTitle });
    navigate('/order');
  };

  if (loading) {
    return <p className="missing-panel__status">Checking what you need…</p>;
  }

  if (error) {
    return <p className="missing-panel__error" role="alert">{error}</p>;
  }

  return (
    <section className="missing-panel" aria-label="Ingredient comparison">
      <h3 className="missing-panel__title">Fridge check</h3>

      {have.length > 0 && (
        <div className="missing-panel__group">
          <p className="missing-panel__label missing-panel__label--have">You have</p>
          <ul className="missing-panel__list">
            {have.map((item, i) => (
              <li key={`have-${i}`} className="missing-panel__item missing-panel__item--have">
                {item.measure && <span className="missing-panel__measure">{item.measure}</span>}
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {missing.length === 0 ? (
        <p className="missing-panel__all-good">You have everything for this recipe.</p>
      ) : (
        <>
          <div className="missing-panel__group">
            <p className="missing-panel__label missing-panel__label--missing">Missing</p>
            <ul className="missing-panel__list">
              {missing.map((item, i) => (
                <li key={`miss-${i}`} className="missing-panel__item missing-panel__item--missing">
                  {item.measure && <span className="missing-panel__measure">{item.measure}</span>}
                  {item.name}
                </li>
              ))}
            </ul>
          </div>

          {orderableMissing.length > 0 && (
            <button type="button" className="missing-panel__order-btn" onClick={handleOrderMissing}>
              Order {orderableMissing.length} missing ingredient{orderableMissing.length > 1 ? 's' : ''}
            </button>
          )}

          {unlistedMissing.length > 0 && (
            <p className="missing-panel__note">
              {unlistedMissing.length} item{unlistedMissing.length > 1 ? 's' : ''} not in our shop yet:{' '}
              {unlistedMissing.map((i) => i.name).join(', ')}
            </p>
          )}
        </>
      )}
    </section>
  );
}
