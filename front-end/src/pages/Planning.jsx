import React, { useState, useEffect } from 'react';
import './Planning.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];

const PlanningPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manualExpenses, setManualExpenses] = useState([]);
  const [orderSpending, setOrderSpending] = useState(0);
  const [budgetLimit, setBudgetLimit] = useState(500);
  const [error, setError] = useState('');

  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState({ day: '', type: '' });
  const [modalInput, setModalInput] = useState('');
  const [expenseInput, setExpenseInput] = useState('');

  useEffect(() => {
    fetchPlans();
    fetchSpending();
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/planning/budget-data`, {
        headers: { 'x-auth-token': token }
      });
      const data = await response.json();
      if (response.ok) {
        setBudgetLimit(data.budgetLimit || 500);
        setManualExpenses(data.expenses || []);
      }
    } catch (err) {
      console.error("Failed to fetch budget data", err);
    }
  };

  const fetchSpending = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        headers: { 'x-auth-token': token }
      });
      const orders = await response.json();
      if (response.ok && Array.isArray(orders)) {
        const total = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        setOrderSpending(total);
      }
    } catch (err) {
      console.error("Failed to fetch order spending", err);
      setError('Unable to connect to the server.');
    }
  };

  const submitManualSpend = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!expenseInput || isNaN(expenseInput)) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/planning/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ amount: parseFloat(expenseInput) })
      });
      const data = await response.json();
      if (response.ok) {
        setManualExpenses([...manualExpenses, data]);
        setExpenseInput('');
        setIsExpenseModalOpen(false);
      }
    } catch (err) {
      setError('Failed to save expense.');
    }
  };

  const handleUpdateBudget = async () => {
    const newLimit = prompt("Set your monthly budget limit (MAD):", budgetLimit);
    if (!newLimit || isNaN(newLimit)) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/planning/budget-limit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ limit: parseFloat(newLimit) })
      });
      if (response.ok) setBudgetLimit(parseFloat(newLimit));
    } catch (err) {
      setError('Failed to update budget limit.');
    }
  };

  const totalSpent = manualExpenses.reduce((sum, e) => sum + e.amount, 0) + orderSpending;
  const budgetPercent = Math.min((totalSpent / budgetLimit) * 100, 100);

  const fetchPlans = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/planning`, {
        headers: { 'x-auth-token': token }
      });
      const data = await response.json();
      if (response.status === 401) {
        setError('Session expired or access denied. Log in again from your profile if the problem persists.');
        setPlans([]);
        return;
      }
      if (response.ok) setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch meal plans", err);
      setError('Unable to connect to the server.');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const submitMeal = async (e) => {
    e.preventDefault();
    if (!modalInput.trim()) return;
    setError('');
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/planning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          dayOfWeek: activeSlot.day,
          mealType: activeSlot.type,
          recipeTitle: modalInput.trim()
        })
      });
      const data = await response.json();
      if (response.ok) {
        setPlans(prev => [...prev, data]);
        setModalInput('');
        setIsMealModalOpen(false);
      } else {
        setError(data.message || 'Failed to add meal');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to connect to the server.');
    }
  };

  const handleRemove = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/planning/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (response.ok) {
        setPlans(prev => prev.filter(p => p._id !== id));
      }
    } catch (err) {
      setError('Unable to connect to the server.');
    }
  };

  const handleDeleteExpense = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/planning/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (response.ok) {
        setManualExpenses(prev => prev.filter(e => e._id !== id));
      }
    } catch (err) {
      setError('Failed to delete expense.');
    }
  };

  const openMealModal = (day, type) => {
    setActiveSlot({ day, type });
    setIsMealModalOpen(true);
  };

  if (loading) return <div className="snapcook-planning">Loading your week...</div>;

  return (
    <div className="snapcook-planning fade-in">

      {/* Header — search bar only, + Recipe button removed */}
      <div className="snapcook-planning__search-row">
        <div className="cookpal-search snapcook-planning__search">
          <span className="cookpal-search__icon" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </span>
          <input
            type="search"
            className="cookpal-search__input"
            placeholder="Search recipes, ingredients..."
            aria-label="Search recipes and ingredients"
          />
          <span className="snapcook-planning__mic" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </span>
        </div>
      </div>

      <div className="snapcook-planning__head">
        <div>
          <h1 className="snapcook-planning__title">Meal Planning</h1>
          <p className="snapcook-planning__lead">Organize your weekly nutrition and stay on track with your goals.</p>
        </div>
      </div>

      {error && <div className="snapcook-planning__alert">{error}</div>}

      <div className="snapcook-week-grid">
        {DAYS.map(day => (
          <section key={day} className="snapcook-day-card">
            <h3 className="snapcook-day-card__title">{day}</h3>
            <div className="snapcook-day-card__meals">
              {MEAL_TYPES.map(type => {
                const meal = (plans || []).find(p => p.dayOfWeek === day && p.mealType === type);
                return (
                  <div key={type} className="snapcook-meal-slot">
                    <span className="snapcook-meal-slot__label">{type}</span>
                    {meal ? (
                      <div className="snapcook-meal-item fade-in">
                        <span className="snapcook-meal-item__name">{meal.recipeTitle}</span>
                        <button
                          type="button"
                          className="snapcook-meal-item__remove"
                          onClick={() => handleRemove(meal._id)}
                          aria-label={`Remove ${meal.recipeTitle}`}
                        >✕</button>
                      </div>
                    ) : (
                      <button type="button" className="snapcook-meal-add" onClick={() => openMealModal(day, type)}>
                        <span>+</span> Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Monthly Budget */}
      <section className="snapcook-budget-card">
        <div className="snapcook-budget-card__header">
          <div>
            <h3 className="snapcook-budget-card__title">Monthly Budget Overview</h3>
            <p className="snapcook-budget-card__meta">Combines app orders and manual grocery logs</p>
          </div>
          <div className="snapcook-budget-card__actions">
            <button type="button" className="snapcook-budget-card__btn snapcook-budget-card__btn--ghost" onClick={handleUpdateBudget}>
              Set Limit
            </button>
            <button type="button" className="snapcook-budget-card__btn" onClick={() => setIsExpenseModalOpen(true)}>
              Log Expense
            </button>
          </div>
        </div>
        <div className="snapcook-budget-card__visualizer">
          <div className="snapcook-budget-card__stats">
            <div className="snapcook-budget-card__stat">
              <span>Total Spent</span>
              <strong className={totalSpent > budgetLimit ? 'text-danger' : ''}>
                {totalSpent.toFixed(2)} MAD
              </strong>
            </div>
            <div className="snapcook-budget-card__stat">
              <span>Remaining</span>
              <strong>{Math.max(budgetLimit - totalSpent, 0).toFixed(2)} MAD</strong>
            </div>
          </div>
          <div className="snapcook-budget-card__progress-wrap">
            <div className="snapcook-budget-card__progress">
              <div
                className={`snapcook-budget-card__fill ${totalSpent > budgetLimit ? 'snapcook-budget-card__fill--over' : ''}`}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
            <div className="snapcook-budget-card__labels">
              <span>0 MAD</span>
              <span>Budget Limit: {budgetLimit} MAD</span>
            </div>
          </div>
        </div>
      </section>

      {/* Expense Log */}
      {manualExpenses.length > 0 && (
        <section className="snapcook-budget-card" style={{ marginTop: '16px' }}>
          <div className="snapcook-budget-card__header">
            <div>
              <h3 className="snapcook-budget-card__title">Expense Log</h3>
              <p className="snapcook-budget-card__meta">All manually logged grocery expenses</p>
            </div>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {manualExpenses.map((exp) => (
              <li
                key={exp._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(88,74,45,0.10)',
                  fontSize: '0.93rem',
                }}
              >
                <span style={{ color: '#5a6b62', fontWeight: 500 }}>
                  {exp.description || 'Groceries'}
                  {exp.createdAt && (
                    <span style={{ marginLeft: 8, fontSize: '0.78rem', color: '#9aa49d' }}>
                      {new Date(exp.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <strong style={{ color: '#273d2f' }}>{exp.amount?.toFixed(2)} MAD</strong>
                  <button
                    type="button"
                    onClick={() => handleDeleteExpense(exp._id)}
                    aria-label={`Delete expense of ${exp.amount} MAD`}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#b42343',
                      fontSize: '1rem',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      lineHeight: 1,
                    }}
                  >✕</button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Add Meal Modal */}
      {isMealModalOpen && (
        <div className="modal-overlay fade-in">
          <div className="modal-content glass-panel">
            <h2>Plan {activeSlot.type}</h2>
            <p className="modal-subtitle">What are you cooking on {activeSlot.day}?</p>
            <form className="modal-form" onSubmit={submitMeal}>
              <div className="modal-form__group">
                <input
                  type="text"
                  placeholder="e.g. Grilled Chicken Salad"
                  value={modalInput}
                  onChange={(e) => setModalInput(e.target.value)}
                  autoFocus
                  className="form-input-modern"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-btn modal-btn--cancel" onClick={() => setIsMealModalOpen(false)}>Cancel</button>
                <button type="submit" className="modal-btn modal-btn--save">Add to Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Expense Modal */}
      {isExpenseModalOpen && (
        <div className="modal-overlay fade-in">
          <div className="modal-content glass-panel">
            <h2>Log Grocery Expense</h2>
            <p className="modal-subtitle">Enter the amount spent at the store</p>
            <form className="modal-form" onSubmit={submitManualSpend}>
              <div className="modal-form__group">
                <div className="input-with-currency">
                  <span className="currency-prefix" style={{ left: 12, width: 40 }}>MAD</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={expenseInput}
                    onChange={(e) => setExpenseInput(e.target.value)}
                    autoFocus
                    className="form-input-modern"
                    style={{ paddingLeft: '50px' }}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-btn modal-btn--cancel" onClick={() => setIsExpenseModalOpen(false)}>Cancel</button>
                <button type="submit" className="modal-btn modal-btn--save">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanningPage;
