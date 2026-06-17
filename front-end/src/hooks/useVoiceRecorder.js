import { useState, useRef, useEffect, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
const MIN_BLOB_BYTES = 500

const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

const pickMimeType = () => {
  if (typeof MediaRecorder === 'undefined') return ''
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
  return types.find((t) => MediaRecorder.isTypeSupported(t)) || ''
}

const extensionForMime = (mime) => {
  if (mime.includes('mp4')) return 'm4a'
  if (mime.includes('ogg')) return 'ogg'
  return 'webm'
}

const isQuotaError = (message) =>
  /quota|billing|insufficient/i.test(message || '')

const collectTranscriptFromEvent = (event) => {
  let text = ''
  const start = typeof event.resultIndex === 'number' ? event.resultIndex : 0
  for (let i = start; i < event.results.length; i++) {
    text += event.results[i][0]?.transcript || ''
  }
  return text.trim()
}

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [voiceNote, setVoiceNote] = useState(null)

  const recognitionRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const mimeTypeRef = useRef('audio/webm')
  const modeRef = useRef(null) // 'speech' | 'whisper'
  const lastTranscriptRef = useRef('')

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      stopStream()
    }
  }, [stopStream])

  const commitTranscription = useCallback((text) => {
    const trimmed = text.trim()
    if (!trimmed) return false
    lastTranscriptRef.current = trimmed
    setTranscription(trimmed)
    return true
  }, [])

  const startBrowserDictation = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) return false

    setVoiceNote('Listening... speak then click the mic to stop.')
    lastTranscriptRef.current = ''

    const recognition = new SpeechRecognition()
    recognition.lang = navigator.language?.toLowerCase().startsWith('fr') ? 'fr-FR' : 'en-US'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      modeRef.current = 'speech'
      setIsRecording(true)
      setVoiceNote('Speaking now... click the mic when finished.')
    }

    recognition.onresult = (event) => {
      const trimmed = collectTranscriptFromEvent(event)
      if (trimmed) {
        lastTranscriptRef.current = trimmed
        setTranscription(trimmed)
      }
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        setVoiceNote('No speech detected. Please speak louder.')
      } else if (event.error !== 'aborted') {
        setVoiceNote(
          event.error === 'not-allowed'
            ? 'Grant microphone access to use voice input.'
            : `Error: ${event.error}`
        )
      }
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
      const finalText = lastTranscriptRef.current.trim()
      if (finalText) {
        commitTranscription(finalText)
        setVoiceNote(null)
      } else {
        setVoiceNote((prev) => {
          if (prev && !/Speaking|Listening/i.test(prev)) return prev
          return 'No text captured. Try again or use Chrome/Edge.'
        })
      }
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      return true
    } catch (err) {
      setVoiceNote(err?.message || 'Unable to start voice input.')
      setIsRecording(false)
      return false
    }
  }, [commitTranscription])

  const transcribeBlob = useCallback(
    async (blob, mimeType) => {
      setIsTranscribing(true)
      setVoiceNote('Transcription en cours…')
      try {
        if (blob.size < MIN_BLOB_BYTES) {
          setVoiceNote('Enregistrement trop court. Parlez 2–3 secondes minimum.')
          return
        }

        const ext = extensionForMime(mimeType)
        const formData = new FormData()
        formData.append('file', blob, `recording.${ext}`)

        const response = await fetch(`${API_BASE}/api/transcribe`, {
          method: 'POST',
          body: formData,
        })

        const result = await response.json().catch(() => ({}))

        if (!response.ok) {
          const msg = result.error || `Erreur serveur (${response.status})`
          if (isQuotaError(msg) && getSpeechRecognition()) {
            setVoiceNote('API quota exhausted - switching to browser dictation...')
            startBrowserDictation()
            return
          }
          if (isQuotaError(msg)) {
            throw new Error(
              'Quota API épuisé. Utilisez Chrome ou Edge, ou rechargez votre clé Groq.'
            )
          }
          throw new Error(msg)
        }

        const text = (result.text || result.transcription || '').trim()
        if (text) {
          commitTranscription(text)
          setVoiceNote(null)
        } else {
          setVoiceNote('Aucun texte reconnu. Parlez plus fort ou plus longtemps.')
        }
      } catch (error) {
        console.error('Transcription error:', error)
        const msg = error.message || 'Transcription impossible.'
        if (getSpeechRecognition() && !msg.includes('Failed to fetch')) {
          setVoiceNote(`${msg} - trying with browser dictation...`)
          startBrowserDictation()
        } else if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
          setVoiceNote(
            'Serveur injoignable. Lancez le backend (port 5000) ou utilisez Chrome/Edge pour la dictée.'
          )
        } else {
          setVoiceNote(msg)
        }
      } finally {
        setIsTranscribing(false)
      }
    },
    [commitTranscription, startBrowserDictation]
  )

  const stopWhisperRecording = useCallback(() => {
    const rec = mediaRecorderRef.current
    if (!rec || rec.state !== 'recording') return Promise.resolve(null)

    return new Promise((resolve) => {
      rec.addEventListener(
        'stop',
        () => {
          setIsRecording(false)
          stopStream()
          const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current })
          resolve(blob)
        },
        { once: true }
      )
      try {
        rec.requestData()
      } catch {
        /* ignore */
      }
      rec.stop()
    })
  }, [stopStream])

  const startWhisperRecording = useCallback(async () => {
    setVoiceNote(null)
    lastTranscriptRef.current = ''
    chunksRef.current = []

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream
    const mimeType = pickMimeType()
    mimeTypeRef.current = mimeType || 'audio/webm'

    let rec
    try {
      rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
    } catch {
      rec = new MediaRecorder(stream)
      mimeTypeRef.current = rec.mimeType || 'audio/webm'
    }

    mediaRecorderRef.current = rec
    rec.ondataavailable = (e) => {
      if (e.data?.size) chunksRef.current.push(e.data)
    }

    modeRef.current = 'whisper'
    rec.start(250)
    setIsRecording(true)
    setVoiceNote('Parlez 2–3 secondes, puis recliquez sur le micro.')
  }, [])

  const toggleRecording = useCallback(async () => {
    if (isTranscribing) return

    if (isRecording && modeRef.current === 'speech' && recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        setIsRecording(false)
      }
      return
    }

    if (isRecording && modeRef.current === 'whisper') {
      const blob = await stopWhisperRecording()
      if (blob?.size > 0) {
        await transcribeBlob(blob, mimeTypeRef.current)
      } else {
        setVoiceNote('Enregistrement vide. Réessayez.')
      }
      return
    }

    if (getSpeechRecognition()) {
      const started = startBrowserDictation()
      if (started) return
    }

    try {
      await startWhisperRecording()
    } catch (err) {
      stopStream()
      setIsRecording(false)
      setVoiceNote(
        err?.message
          ? `Micro : ${err.message}`
          : 'Autorisez l’accès au micro. Sur Firefox, utilisez Chrome ou Edge pour la dictée.'
      )
    }
  }, [
    isRecording,
    isTranscribing,
    startBrowserDictation,
    startWhisperRecording,
    stopWhisperRecording,
    transcribeBlob,
    stopStream,
  ])

  return {
    isRecording,
    isTranscribing,
    transcription,
    voiceNote,
    toggleRecording,
    clearTranscription: () => {
      lastTranscriptRef.current = ''
      setTranscription('')
    },
  }
}
