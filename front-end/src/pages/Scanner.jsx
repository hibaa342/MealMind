import React, { useState, useRef, useCallback } from 'react';
import './Scanner.css';

// ─── mock: replace with real API call ────────────────────────────────────────
const MOCK_INGREDIENTS = [
  { id: 1, name: 'Tomatoes', emoji: '🍅', confidence: 97 },
  { id: 2, name: 'Cheese',   emoji: '🧀', confidence: 94 },
  { id: 3, name: 'Carrots',  emoji: '🥕', confidence: 91 },
  { id: 4, name: 'Eggs',     emoji: '🥚', confidence: 89 },
  { id: 5, name: 'Onions',   emoji: '🧅', confidence: 85 },
  { id: 6, name: 'Milk',     emoji: '🥛', confidence: 82 },
];

// ─── Step Bar ────────────────────────────────────────────────────────────────
function StepBar({ phase }) {
  const steps = ['Photo', 'Analyse', 'Results'];
  const active = [['idle', 'preview'], ['analyzing'], ['results']];
  const done = (i) =>
    (i === 0 && ['analyzing', 'results'].includes(phase)) ||
    (i === 1 && phase === 'results');

  return (
    <div className="scanner-stepbar">
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div className="scanner-step">
            <div className={[
              'scanner-step__dot',
              done(i) ? 'scanner-step__dot--done' : active[i].includes(phase) ? 'scanner-step__dot--active' : '',
            ].join(' ')}>
              {done(i) ? '✓' : i + 1}
            </div>
            <span className={[
              'scanner-step__label',
              done(i) || active[i].includes(phase) ? 'scanner-step__label--active' : '',
            ].join(' ')}>
              {label}
            </span>
          </div>
          {i < 2 && (
            <div className={['scanner-step__line', done(i) ? 'scanner-step__line--done' : ''].join(' ')} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Ingredient Chip ─────────────────────────────────────────────────────────
function IngredientChip({ ing, onRemove }) {
  return (
    <div className="scanner-chip">
      <span className="scanner-chip__emoji">{ing.emoji}</span>
      <span className="scanner-chip__name">{ing.name}</span>
      {ing.confidence && (
        <span className="scanner-chip__conf">{ing.confidence}%</span>
      )}
      <button
        className="scanner-chip__remove"
        onClick={() => onRemove(ing.id)}
        title="Remove"
      >✕</button>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
const ScannerPage = () => { // Removed { user } prop as it wasn't being used
  const [phase, setPhase] = useState('idle'); 
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newIng, setNewIng] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setPreviewUrl(URL.createObjectURL(file));
    setPhase('preview');
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const reset = () => {
    setPhase('idle'); 
    setPreviewUrl(null);
    setIngredients([]); 
    setProgress(0);
    setShowAdd(false); 
    setNewIng('');
  };

  const handleAnalyze = () => {
    setPhase('analyzing'); 
    setProgress(0);
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(iv);
          setIngredients(MOCK_INGREDIENTS);
          setPhase('results');
          return 100;
        }
        return p + Math.random() * 11;
      });
    }, 180);
  };

  const addIngredient = () => {
    if (!newIng.trim()) return;
    setIngredients(prev => [...prev, { id: Date.now(), name: newIng.trim(), emoji: '🥘', confidence: null }]);
    setNewIng(''); 
    setShowAdd(false);
  };

  const removeIngredient = (id) => setIngredients(prev => prev.filter(i => i.id !== id));

  const analyzeSteps = [
    { label: 'Object detection', done: progress > 25 },
    { label: 'Food classification', done: progress > 55 },
    { label: 'Quantity estimation', done: progress > 80 },
    { label: 'Finalisation', done: progress >= 100 },
  ];

  return (
    <div className="cookpal-page scanner-page">
      <h1 className="cookpal-page__title">Fridge & pantry scan</h1>
      <p className="cookpal-page__lead">
        Upload a photo of your fridge or cupboard — AI detects your ingredients automatically.
      </p>

      <StepBar phase={phase} />

      {/* PHASE: idle / preview */}
      {(phase === 'idle' || phase === 'preview') && (
        <div className="card scanner-card">
          <div
            className={[
              'scanner-dropzone',
              dragOver ? 'scanner-dropzone--dragover' : '',
              previewUrl ? 'scanner-dropzone--preview' : '',
            ].join(' ')}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => !previewUrl && fileRef.current.click()}
          >
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="preview" className="scanner-preview__img" />
                <button
                  className="scanner-preview__change"
                  onClick={e => { e.stopPropagation(); reset(); }}
                >✕ Change photo</button>
              </>
            ) : (
              <div className="scanner-dropzone__content">
                <div className="scanner-dropzone__icon">{dragOver ? '⬇️' : '📂'}</div>
                <p className="scanner-dropzone__title">Drag & drop your photo here</p>
                <p className="scanner-dropzone__or">or</p>
                <button
                  className="btn btn-primary"
                  style={{ borderRadius: 12, padding: '11px 28px', fontSize: 15 }}
                  onClick={() => fileRef.current.click()}
                >Choose a photo</button>
                <p className="scanner-dropzone__hint">JPG, PNG, HEIC — max 20 MB</p>
              </div>
            )}
          </div>

          <input
            ref={fileRef} type="file" accept="image/*"
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])}
          />

          {phase === 'preview' && (
            <div className="scanner-actions">
              <button className="scanner-btn-ghost" onClick={reset}>← Restart</button>
              <button
                className="btn btn-primary"
                onClick={handleAnalyze}
                style={{ borderRadius: 12, padding: '11px 28px', fontSize: 15 }}
              >✨ Analyse with AI</button>
            </div>
          )}
        </div>
      )}

      {/* PHASE: analyzing */}
      {phase === 'analyzing' && (
        <div className="card scanner-analyzing">
          <div className="scanner-analyzing__icon">🤖</div>
          <h2 className="scanner-analyzing__title">Analysing your photo…</h2>
          <p className="scanner-analyzing__sub">The AI is identifying ingredients in your image</p>

          <div className="scanner-progress">
            <div className="scanner-progress__fill" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <p className="scanner-progress__pct">{Math.min(Math.round(progress), 100)}%</p>

          <div className="scanner-analyze-steps">
            {analyzeSteps.map((s, i) => (
              <div key={i} className="scanner-analyze-step">
                <span className={['scanner-analyze-step__dot', s.done ? 'scanner-analyze-step__dot--done' : ''].join(' ')}>
                  {s.done ? '✓' : ''}
                </span>
                <span className={['scanner-analyze-step__label', s.done ? 'scanner-analyze-step__label--done' : ''].join(' ')}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PHASE: results */}
      {phase === 'results' && (
        <>
          <div className="card">
            <div className="scanner-results__header">
              <div>
                <h2 className="scanner-results__title">🎯 {ingredients.length} ingredients detected</h2>
                <p className="scanner-results__sub">Check and correct if needed before generating your recipe</p>
              </div>
              {previewUrl && (
                <img src={previewUrl} alt="scan thumbnail" className="scanner-results__thumb" />
              )}
            </div>

            <div className="scanner-chips">
              {ingredients.map(ing => (
                <IngredientChip key={ing.id} ing={ing} onRemove={removeIngredient} />
              ))}

              {showAdd ? (
                <div className="scanner-add-input">
                  <input
                    autoFocus
                    className="scanner-add-input__field"
                    placeholder="Ingredient name"
                    value={newIng}
                    onChange={e => setNewIng(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') addIngredient();
                      if (e.key === 'Escape') { setShowAdd(false); setNewIng(''); }
                    }}
                  />
                  <button className="scanner-add-input__confirm" onClick={addIngredient}>✓</button>
                  <button className="scanner-add-input__cancel" onClick={() => { setShowAdd(false); setNewIng(''); }}>✕</button>
                </div>
              ) : (
                <button className="scanner-add-btn" onClick={() => setShowAdd(true)}>
                  + Add ingredient
                </button>
              )}
            </div>

            <hr className="scanner-divider" />
            <p className="scanner-note">
              <span>💡</span>
              <span>These ingredients will be sent to <strong>AI</strong> to generate personalised recipes.</span>
            </p>
          </div>

          <div className="scanner-cta">
            <button className="scanner-btn-ghost" onClick={reset}>🔄 New scan</button>
            <button
              className={['btn btn-primary', ingredients.length === 0 ? 'scanner-btn-disabled' : ''].join(' ')}
              disabled={ingredients.length === 0}
              style={{ borderRadius: 12, padding: '11px 28px', fontSize: 15 }}
              onClick={() => console.log('Generate recipes for:', ingredients)}
            >🍳 Generate my recipes →</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ScannerPage;