import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ChatbotWidget.css';

/* ── Language Detection ─────────────────────────────────────── */
const FRENCH_WORDS = /\b(le|la|les|je|tu|il|elle|nous|vous|ils|elles|est|sont|avec|dans|sur|pour|mais|ou|et|donc|car|bonjour|merci|oui|non|comment|pourquoi|quand|où|qui|que|quoi|c'est|du|des|une|un)\b/i;

function detectLanguage(text) {
  if (!text?.trim()) return { code: 'ar-MA', flag: '🇲🇦', label: 'Darija' };
  if (/[\u0600-\u06FF]/.test(text))  return { code: 'ar-MA', flag: '🇲🇦', label: 'Darija' };
  if (FRENCH_WORDS.test(text))        return { code: 'fr-FR', flag: '🇫🇷', label: 'Français' };
  return { code: 'en-US', flag: '🇬🇧', label: 'English' };
}

/* ── Parse response — detect recipe JSON ────────────────────── */
function parseResponse(text) {
  try {
    const clean = text.replace(/```json|```/gi, '').trim();
    const parsed = JSON.parse(clean);
    if (parsed?.type === 'recipe') return { kind: 'recipe', data: parsed };
  } catch (_) {}
  return { kind: 'text', data: text };
}

/* ── Time formatter ─────────────────────────────────────────── */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0 && s > 0) return `${m}m ${s}s`;
  if (m > 0)          return `${m}m`;
  return `${s}s`;
}

/* ── SVG Icons ──────────────────────────────────────────────── */
const ChatIcon  = () => <svg className="icon-chat"  viewBox="0 0 24 24"><path d="M12 3C6.48 3 2 6.92 2 11.7c0 2.64 1.3 5.01 3.38 6.67L4 22l4.46-1.97C9.56 20.63 10.75 21 12 21c5.52 0 10-3.92 10-8.7C22 6.92 17.52 3 12 3z"/></svg>;
const CloseIcon = () => <svg className="icon-close" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>;
const MicIcon   = () => <svg viewBox="0 0 24 24"><path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-1 16.93V20H9v2h6v-2h-2v-2.07A8 8 0 0 0 20 11h-2a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.93z"/></svg>;
const StopIcon  = () => <svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>;
const SendIcon  = () => <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>;

/* ── SpeechRecognition shim ─────────────────────────────────── */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const IDLE_PROMPTS = [
  'Ready. How can I help you cook today?',
  'Ask me for a recipe in any language.',
  'Try: "Give me a recipe for couscous"',
];

/* ══════════════════════════════════════════════════════════════
   RECIPE CARD COMPONENT
══════════════════════════════════════════════════════════════ */
function RecipeCard({ recipe, onSpeak }) {
  const [servings, setServings]   = useState(recipe.servings || 4);
  const baseServings               = recipe.servings || 4;
  // timers: { [stepId]: { remaining, running, done } }
  const [timers, setTimers]       = useState({});
  const intervalRefs               = useRef({});

  const ratio = servings / baseServings;

  const changeServings = (delta) =>
    setServings(prev => Math.max(1, prev + delta));

  const scaleAmount = (base) => {
    const scaled = Math.round(base * ratio * 100) / 100;
    return scaled % 1 === 0 ? scaled : scaled.toFixed(2);
  };

  const startTimer = (stepId, totalSeconds) => {
    if (intervalRefs.current[stepId]) return;
    setTimers(prev => ({ ...prev, [stepId]: { remaining: totalSeconds, running: true, done: false } }));

    intervalRefs.current[stepId] = setInterval(() => {
      setTimers(prev => {
        const cur = prev[stepId];
        if (!cur || cur.remaining <= 1) {
          clearInterval(intervalRefs.current[stepId]);
          delete intervalRefs.current[stepId];
          onSpeak?.('Timer done!', 'en-US');
          return { ...prev, [stepId]: { remaining: 0, running: false, done: true } };
        }
        return { ...prev, [stepId]: { ...cur, remaining: cur.remaining - 1 } };
      });
    }, 1000);
  };

  const stopTimer = (stepId) => {
    clearInterval(intervalRefs.current[stepId]);
    delete intervalRefs.current[stepId];
    setTimers(prev => ({ ...prev, [stepId]: { ...prev[stepId], running: false } }));
  };

  // cleanup on unmount
  useEffect(() => () => Object.values(intervalRefs.current).forEach(clearInterval), []);

  return (
    <div className="recipe-card">
      {/* ── Header ── */}
      <div className="recipe-header">
        <div className="recipe-title-row">
          <h2 className="recipe-title">{recipe.title}</h2>
        </div>
        {recipe.description && (
          <p className="recipe-desc">{recipe.description}</p>
        )}
        <div className="servings-control">
          <span className="servings-label">Servings</span>
          <button
            className="servings-btn"
            onClick={() => changeServings(-1)}
            aria-label="Decrease servings"
          >−</button>
          <span className="servings-count">{servings}</span>
          <button
            className="servings-btn"
            onClick={() => changeServings(1)}
            aria-label="Increase servings"
          >+</button>
        </div>
      </div>

      {/* ── Ingredients ── */}
      <div className="recipe-section">
        <h3 className="recipe-section-title">
          <span className="section-icon">🧂</span> Ingredients
        </h3>
        <ul className="ingredient-list">
          {recipe.ingredients?.map((ing) => (
            <li key={ing.id} className="ingredient-item">
              <span className="ing-amount">{scaleAmount(ing.amount)}</span>
              {ing.unit && <span className="ing-unit">{ing.unit}</span>}
              <span className="ing-name">{ing.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Steps ── */}
      <div className="recipe-section">
        <h3 className="recipe-section-title">
          <span className="section-icon">👨‍🍳</span> Steps
        </h3>
        <div className="steps-list">
          {recipe.steps?.map((step, idx) => {
            const timer = timers[step.id];
            return (
              <div key={step.id} className="step-item">
                <div className="step-number">{idx + 1}</div>
                <div className="step-body">
                  <strong className="step-title">{step.title}</strong>
                  <p className="step-content">{step.content}</p>
                  {step.timer_seconds && (
                    <div className="timer-row">
                      {!timer?.running && !timer?.done && (
                        <button
                          className="timer-btn"
                          onClick={() => startTimer(step.id, step.timer_seconds)}
                        >
                          ⏱ Start {formatTime(step.timer_seconds)} timer
                        </button>
                      )}
                      {timer?.running && (
                        <>
                          <span className="timer-display running">
                            ⏳ {formatTime(timer.remaining)}
                          </span>
                          <button
                            className="timer-stop-btn"
                            onClick={() => stopTimer(step.id)}
                          >Stop</button>
                        </>
                      )}
                      {timer?.done && (
                        <span className="timer-display done">✅ Done!</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Notes ── */}
      {recipe.notes && (
        <div className="recipe-notes">
          <span className="notes-icon">💡</span> {recipe.notes}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN CHATBOT WIDGET
══════════════════════════════════════════════════════════════ */
export default function ChatbotWidget() {
  const [isOpen,       setIsOpen]       = useState(false);
  const [isRecording,  setIsRecording]  = useState(false);
  const [isThinking,   setIsThinking]   = useState(false);
  const [isSpeaking,   setIsSpeaking]   = useState(false);
  const [transcript,   setTranscript]   = useState('');
  const [inputText,    setInputText]    = useState('');
  const [messages,     setMessages]     = useState([]); // { role, text, recipe? }
  const [detectedLang, setDetectedLang] = useState({ code: 'ar-MA', flag: '🇲🇦', label: 'Darija' });
  const [error,        setError]        = useState('');
  const [idleIdx,      setIdleIdx]      = useState(0);

  const recognitionRef = useRef(null);
  const logEndRef      = useRef(null);
  const inputRef       = useRef(null);

  useEffect(() => {
    if (isOpen && !isRecording && !isThinking && !isSpeaking && messages.length === 0) {
      const t = setInterval(() => setIdleIdx(i => (i + 1) % IDLE_PROMPTS.length), 4000);
      return () => clearInterval(t);
    }
  }, [isOpen, isRecording, isThinking, isSpeaking, messages.length]);

  useEffect(() => {
    const handleToggle = () => toggleOpen();
    window.addEventListener('toggle-chatbot', handleToggle);
    return () => window.removeEventListener('toggle-chatbot', handleToggle);
  }, []);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isThinking]);

  /* ── TTS ─────────────────────────────────────────────────── */
  const speakText = useCallback((text, langCode) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utter  = new SpeechSynthesisUtterance(text);
    utter.lang   = langCode || detectedLang.code;
    utter.rate   = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const match  = voices.find(v => v.lang.startsWith((langCode || detectedLang.code).split('-')[0]));
    if (match) utter.voice = match;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend   = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  }, [detectedLang.code]);

  /* ── Handle AI response ─────────────────────────────────── */
  const handleResponse = useCallback((rawText, userLang) => {
    const parsed = parseResponse(rawText);

    if (parsed.kind === 'recipe') {
      const recipe = parsed.data;
      // Speak a short confirmation, not the JSON
      const confirmMsg = userLang?.code === 'fr-FR'
        ? `Voici la recette de ${recipe.title}`
        : userLang?.code === 'ar-MA'
        ? `هاهي وصفة ${recipe.title}`
        : `Here is the recipe for ${recipe.title}`;
      speakText(confirmMsg, userLang?.code);
      setMessages(prev => [...prev, { role: 'bot', recipe }]);
    } else {
      speakText(parsed.data, userLang?.code);
      setMessages(prev => [...prev, { role: 'bot', text: parsed.data, lang: detectLanguage(parsed.data) }]);
    }
  }, [speakText]);

  /* ── Send to backend ─────────────────────────────────────── */
  const sendToBackend = useCallback(async (text) => {
    if (!text.trim()) return;
    const lang = detectLanguage(text);
    setDetectedLang(lang);
    setError('');
    setMessages(prev => [...prev, { role: 'user', text, lang }]);
    setIsThinking(true);

    try {
      const res  = await fetch(`${API_BASE}/api/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      handleResponse(data.reply || '', lang);
    } catch (err) {
      console.error('[Chatbot]', err);
      setError(err.message);
      setMessages(prev => [...prev, { role: 'bot', text: '⚠️ Could not reach assistant.', lang: { code: 'en-US' } }]);
    } finally {
      setIsThinking(false);
    }
  }, [handleResponse]);

  /* ── Voice ──────────────────────────────────────────────── */
  const startRecording = useCallback(() => {
    if (!SpeechRecognition) { setError('Voice not supported — use Chrome.'); return; }
    if (isRecording) return;
    const r    = new SpeechRecognition();
    recognitionRef.current = r;
    r.continuous     = false;
    r.interimResults = true;
    r.lang           = detectedLang.code;
    let finalText    = '';

    r.onstart  = () => { setIsRecording(true); setTranscript(''); setError(''); };
    r.onresult = (e) => {
      let interim = '';
      finalText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      const combined = (finalText + interim).trim();
      setTranscript(combined);
      if (combined) setDetectedLang(detectLanguage(combined));
    };
    r.onerror  = (e) => { if (e.error !== 'no-speech') setError(`Mic error: ${e.error}`); setIsRecording(false); };
    r.onend    = () => { setIsRecording(false); setTranscript(''); if (finalText.trim()) sendToBackend(finalText.trim()); };
    try { r.start(); } catch { setError('Could not start microphone.'); }
  }, [isRecording, detectedLang.code, sendToBackend]);

  const stopRecording = useCallback(() => recognitionRef.current?.stop(), []);

  /* ── Text submit ────────────────────────────────────────── */
  const handleSend = useCallback(() => {
    const t = inputText.trim();
    if (!t || isThinking) return;
    setInputText('');
    sendToBackend(t);
  }, [inputText, isThinking, sendToBackend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  /* ── Toggle ─────────────────────────────────────────────── */
  const toggleOpen = () => {
    setIsOpen(prev => {
      if (prev) {
        recognitionRef.current?.abort();
        window.speechSynthesis?.cancel();
        setIsRecording(false); setIsSpeaking(false);
        setTranscript(''); setError('');
      }
      return !prev;
    });
  };

  /* ── Derived ────────────────────────────────────────────── */
  const statusText = isRecording
    ? (transcript ? `"${transcript}"` : 'Listening…')
    : isThinking  ? 'Thinking…'
    : isSpeaking  ? 'Speaking…'
    : messages.length === 0 ? IDLE_PROMPTS[idleIdx]
    : '';

  const ringClass = ['cb-ring-wrap',
    isRecording ? 'is-listening' : '',
    isThinking  ? 'is-thinking'  : '',
    isSpeaking  ? 'is-speaking'  : '',
  ].filter(Boolean).join(' ');

  const hasRecipe = messages.some(m => m.recipe);

  return (
    <div className="chatbot-root">

      {/* ── FAB (Desktop only) ── */}
      <button
        id="chatbot-fab-btn"
        className={`chatbot-fab${isOpen ? ' is-open' : ''}`}
        onClick={toggleOpen}
        aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
      >
        <ChatIcon /><CloseIcon />
      </button>

      {/* ── Panel ── */}
      <div
        id="chatbot-panel"
        className={`chatbot-panel${isOpen ? ' is-open' : ''}${hasRecipe ? ' has-recipe' : ''}`}
        role="dialog"
        aria-label="AI Assistant"
      >
        {/* Title */}
        <div className="cb-title-block">
          <div className="cb-app-name">MealMind</div>
          <div className="cb-app-sub">AI Assistant</div>
        </div>

        {/* Orb — hide when a recipe is showing */}
        {!hasRecipe && (
          <div className="cb-orb-area">
            <div className={ringClass}>
              <div className="cb-ring" />
            </div>
            <div className="cb-lang-badge">{detectedLang.flag} {detectedLang.label}</div>
            <div
              className="cb-status-text"
              dir={isRecording && /[\u0600-\u06FF]/.test(transcript) ? 'rtl' : 'ltr'}
            >
              {statusText}
            </div>
          </div>
        )}

        {/* Chat log */}
        {messages.length > 0 && (
          <div className="cb-chat-log" id="chatbot-log">
            {messages.map((msg, i) => {
              if (msg.recipe) {
                return (
                  <RecipeCard
                    key={i}
                    recipe={msg.recipe}
                    onSpeak={(text, lang) => speakText(text, lang)}
                  />
                );
              }
              return (
                <div
                  key={i}
                  className={`cb-bubble ${msg.role}`}
                  dir={msg.lang?.code === 'ar-MA' ? 'rtl' : 'ltr'}
                >
                  {msg.text}
                </div>
              );
            })}

            {isThinking && (
              <div className="cb-bubble bot typing">
                <div className="cb-dot" /><div className="cb-dot" /><div className="cb-dot" />
              </div>
            )}
            <div ref={logEndRef} />
          </div>
        )}

        {/* Error */}
        {error && <div className="cb-error">⚠ {error}</div>}

        {/* Lang badge when recipe visible */}
        {hasRecipe && (
          <div className="cb-lang-badge-bar">
            {detectedLang.flag} {detectedLang.label}
            {isSpeaking && <span className="speaking-dot" />}
          </div>
        )}

        {/* Input bar */}
        <div className="cb-input-bar">
          <input
            id="chatbot-text-input"
            ref={inputRef}
            className="cb-text-input"
            type="text"
            placeholder="Type a message or ask for a recipe…"
            value={inputText}
            onChange={e => {
              setInputText(e.target.value);
              if (e.target.value) setDetectedLang(detectLanguage(e.target.value));
            }}
            onKeyDown={handleKeyDown}
            dir={detectedLang.code === 'ar-MA' ? 'rtl' : 'ltr'}
          />
          {inputText.trim() && (
            <button id="chatbot-send-btn" className="cb-send-btn" onClick={handleSend} disabled={isThinking} aria-label="Send">
              <SendIcon />
            </button>
          )}
          <button
            id="chatbot-mic-btn"
            className={`cb-mic-btn${isRecording ? ' is-recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isThinking}
            aria-label={isRecording ? 'Stop' : 'Speak'}
          >
            {isRecording ? <StopIcon /> : <MicIcon />}
          </button>
        </div>
      </div>
    </div>
  );
}
