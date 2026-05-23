import { useState, useRef, useEffect, useCallback } from 'react'

const API_BASE = 'http://127.0.0.1:5000'
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

  const startBrowserDictation = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) return false

    setVoiceNote(null)
    const recognition = new SpeechRecognition()
    recognition.lang = navigator.language?.toLowerCase().startsWith('fr') ? 'fr-FR' : 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      modeRef.current = 'speech'
      setIsRecording(true)
    }

    recognition.onresult = (event) => {
      let text = ''
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript
      }
      const trimmed = text.trim()
      if (trimmed) setTranscription(trimmed)
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        setVoiceNote('Aucune parole détectée. Réessayez.')
      } else if (event.error !== 'aborted') {
        setVoiceNote(
          event.error === 'not-allowed'
            ? 'Autorisez l’accès au micro pour la dictée.'
            : `Dictée : ${event.error}`
        )
      }
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
      setVoiceNote(null)
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      return true
    } catch (err) {
      setVoiceNote(err?.message || 'Impossible de démarrer la dictée.')
      return false
    }
  }, [])

  const transcribeBlob = useCallback(async (blob, mimeType) => {
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
          setVoiceNote('Quota OpenAI épuisé — bascule sur la dictée du navigateur…')
          startBrowserDictation()
          return
        }
        if (isQuotaError(msg)) {
          throw new Error(
            'Quota OpenAI épuisé. Utilisez Chrome ou Edge, ou rechargez votre compte sur platform.openai.com.'
          )
        }
        throw new Error(msg)
      }

      const text = (result.text || result.transcription || '').trim()
      if (text) {
        setTranscription(text)
        setVoiceNote(null)
      } else {
        setVoiceNote('Aucun texte reconnu. Parlez plus fort ou plus longtemps.')
      }
    } catch (error) {
      console.error('Transcription error:', error)
      setVoiceNote(error.message || 'Transcription impossible.')
    } finally {
      setIsTranscribing(false)
    }
  }, [startBrowserDictation])

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

    // Arrêt dictée navigateur
    if (isRecording && modeRef.current === 'speech' && recognitionRef.current) {
      recognitionRef.current.stop()
      return
    }

    // Arrêt enregistrement Whisper
    if (isRecording && modeRef.current === 'whisper') {
      const blob = await stopWhisperRecording()
      if (blob?.size > 0) {
        await transcribeBlob(blob, mimeTypeRef.current)
      } else {
        setVoiceNote('Enregistrement vide. Réessayez.')
      }
      return
    }

    // Démarrage : dictée navigateur en priorité (gratuite, pas de quota OpenAI)
    if (getSpeechRecognition()) {
      startBrowserDictation()
      return
    }

    // Secours : Whisper via le backend
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
  }
}
