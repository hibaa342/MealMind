import React, { useState, useRef, useCallback } from 'react';
import './Scanner.css';

function StepBar({ phase }) {
  const steps = ['Photo', 'Analyze', 'Results'];
  const active = [['idle', 'preview'], ['analyzing'], ['results']];
  const done = (index) =>
    (index === 0 && ['analyzing', 'results'].includes(phase)) ||
    (index === 1 && phase === 'results');

  return (
    <div className="scanner-stepbar">
      {steps.map((label, index) => (
        <React.Fragment key={label}>
          <div className="scanner-step">
            <div className={`scanner-step__dot ${done(index) ? 'scanner-step__dot--done' : active[index].includes(phase) ? 'scanner-step__dot--active' : ''}`}>
              {index + 1}
            </div>
            <span className={`scanner-step__label ${done(index) || active[index].includes(phase) ? 'scanner-step__label--active' : ''}`}>
              {label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`scanner-step__line ${done(index) ? 'scanner-step__line--done' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function IngredientChip({ ingredient, onRemove }) {
  return (
    <div className="scanner-chip">
      <div className="scanner-chip__content">
        <span className="scanner-chip__name">{ingredient.name}</span>
        {ingredient.confidence != null && (
          <span className="scanner-chip__conf">{ingredient.confidence}%</span>
        )}
      </div>
      <button className="scanner-chip__remove" onClick={() => onRemove(ingredient.id)}>
        Remove
      </button>
    </div>
  );
}

const ScannerPage = () => {
  const [phase, setPhase]               = useState('idle');
  const [dragOver, setDragOver]         = useState(false);
  const [previewUrl, setPreviewUrl]     = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [ingredients, setIngredients]   = useState([]);
  const [progress, setProgress]         = useState(0);
  const [newIng, setNewIng]             = useState('');
  const [showAdd, setShowAdd]           = useState(false);
  const fileRef                         = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPhase('preview');
  };

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setDragOver(false);
    handleFile(event.dataTransfer.files[0]);
  }, []);

  const reset = () => {
    setPhase('idle');
    setPreviewUrl(null);
    setSelectedFile(null);
    setIngredients([]);
    setProgress(0);
    setShowAdd(false);
    setNewIng('');
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setPhase('analyzing');
    setProgress(0);

    // Animate progress bar while waiting for API
    const intervalId = setInterval(() => {
      setProgress((current) => {
        if (current >= 90) {
          clearInterval(intervalId);
          return 90;
        }
        return current + Math.random() * 10;
      });
    }, 180);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/fridge/detect', {
        method : 'POST',
        body   : formData,
      });

      const data = await response.json();

      clearInterval(intervalId);
      setProgress(100);

      if (data.success && data.ingredients.length > 0) {
        const mapped = data.ingredients.map((item, index) => ({
          id         : index + 1,
          name       : item.name,
          confidence : item.confidence ?? null,
        }));
        setIngredients(mapped);
      } else {
        setIngredients([]);
      }

      setPhase('results');

    } catch (error) {
      console.error('Detection error:', error);
      clearInterval(intervalId);
      setProgress(100);
      setIngredients([]);
      setPhase('results');
    }
  };

  const addIngredient = () => {
    if (!newIng.trim()) return;
    setIngredients((prev) => [
      ...prev,
      { id: Date.now(), name: newIng.trim(), confidence: null },
    ]);
    setNewIng('');
    setShowAdd(false);
  };

  const removeIngredient = (id) =>
    setIngredients((prev) => prev.filter((item) => item.id !== id));

  const analyzeSteps = [
    { label: 'Object detection',     done: progress > 25 },
    { label: 'Food classification',  done: progress > 55 },
    { label: 'Quantity estimation',  done: progress > 80 },
    { label: 'Finalization',         done: progress >= 100 },
  ];

  return (
    <div className="cookpal-page scanner-page">
      <h1 className="cookpal-page__title">Scanner</h1>
      <p className="cookpal-page__lead">
        Upload a photo of your fridge or pantry. AI detects the contents automatically.
      </p>

      <StepBar phase={phase} />

      {(phase === 'idle' || phase === 'preview') && (
        <div className="scanner-card fade-in">
          <div
            className={`scanner-dropzone ${dragOver ? 'scanner-dropzone--active' : ''} ${previewUrl ? 'scanner-dropzone--preview' : ''}`}
            onDrop={handleDrop}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => !previewUrl && fileRef.current.click()}
          >
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="Photo preview" className="scanner-preview__img" />
                <button
                  className="scanner-preview__change"
                  onClick={(event) => {
                    event.stopPropagation();
                    reset();
                  }}
                >
                  Change photo
                </button>
              </>
            ) : (
              <div className="scanner-dropzone__content">
                <p className="scanner-dropzone__title">Drag and drop a photo here</p>
                <p className="scanner-dropzone__hint">or choose a file from your device</p>
                <button
                  type="button"
                  className="scanner-dropzone__button"
                  onClick={(event) => {
                    event.stopPropagation();
                    fileRef.current.click();
                  }}
                >
                  Choose photo
                </button>
                <p className="scanner-dropzone__note">JPG, PNG, HEIC - max 20 MB</p>
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(event) => handleFile(event.target.files[0])}
          />

          {phase === 'preview' && (
            <div className="scanner-actions">
              <button className="scanner-cancel" onClick={reset}>Cancel</button>
              <button className="scanner-submit" onClick={handleAnalyze}>Analyze photo</button>
            </div>
          )}
        </div>
      )}

      {phase === 'analyzing' && (
        <div className="scanner-card scanner-analyzing fade-in">
          <h2 className="scanner-analyzing__title">Analyzing your photo</h2>
          <p className="scanner-analyzing__sub">Identifying ingredients in the image</p>

          <div className="scanner-progress">
            <div
              className="scanner-progress__fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="scanner-progress__pct">{Math.min(Math.round(progress), 100)}%</p>

          <div className="scanner-analyze-steps">
            {analyzeSteps.map((step) => (
              <div key={step.label} className="scanner-analyze-step">
                <span className={`scanner-analyze-step__dot ${step.done ? 'scanner-analyze-step__dot--done' : ''}`} />
                <span className={`scanner-analyze-step__label ${step.done ? 'scanner-analyze-step__label--done' : ''}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'results' && (
        <div className="scanner-card fade-in">
          <div className="scanner-results__header">
            <div>
              <h2 className="scanner-results__title">
                {ingredients.length} ingredients detected
              </h2>
              <p className="scanner-results__sub">
                Review and adjust the list before generating your recipe.
              </p>
            </div>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="scan thumbnail"
                className="scanner-results__thumb"
              />
            )}
          </div>

          <div className="scanner-chips">
            {ingredients.map((ingredient) => (
              <IngredientChip
                key={ingredient.id}
                ingredient={ingredient}
                onRemove={removeIngredient}
              />
            ))}

            {showAdd ? (
              <div className="scanner-add-input">
                <input
                  autoFocus
                  className="scanner-add-input__field"
                  placeholder="Ingredient name"
                  value={newIng}
                  onChange={(event) => setNewIng(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') addIngredient();
                  }}
                />
                <button
                  type="button"
                  className="scanner-add-input__confirm"
                  onClick={addIngredient}
                >
                  Add
                </button>
                <button
                  type="button"
                  className="scanner-add-input__cancel"
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="scanner-add-btn"
                onClick={() => setShowAdd(true)}
              >
                Add ingredient
              </button>
            )}
          </div>

          <hr className="scanner-divider" />
          <p className="scanner-note">
            If an ingredient is missing, add it manually before moving on.
          </p>

          <div className="scanner-cta">
            <button className="scanner-cancel" onClick={reset}>
              Scan another photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScannerPage;