import { useState, useRef, useEffect, useCallback } from 'react'

const pickMimeType = () => {
  if (typeof MediaRecorder === 'undefined') return ''
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
  return types.find((t) => MediaRecorder.isTypeSupported(t)) || ''
}

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [voiceNote, setVoiceNote] = useState(null)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const lastBlobUrlRef = useRef(null)
  const audioRef = useRef(null)

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      stopStream()
      if (lastBlobUrlRef.current) URL.revokeObjectURL(lastBlobUrlRef.current)
    }
  }, [stopStream])

  const toggleRecording = async () => {
    if (isRecording && mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      return
    }

    setVoiceNote(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = pickMimeType()
      let rec
      try {
        rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      } catch {
        rec = new MediaRecorder(stream)
      }
      mediaRecorderRef.current = rec
      chunksRef.current = []
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data)
      }
      rec.onstop = () => {
        setIsRecording(false)
        stopStream()
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || mimeType || 'audio/webm' })
        if (lastBlobUrlRef.current) URL.revokeObjectURL(lastBlobUrlRef.current)
        const url = URL.createObjectURL(blob)
        lastBlobUrlRef.current = url
        if (audioRef.current) audioRef.current.src = url
        setVoiceNote('Saved — tap play to listen.')
      }
      rec.start()
      setIsRecording(true)
    } catch (err) {
      stopStream()
      setIsRecording(false)
      setVoiceNote(
        err?.message ? `Microphone: ${err.message}` : 'Allow microphone access to record.'
      )
    }
  }

  const playRecording = async () => {
    const el = audioRef.current
    if (!el?.src) {
      setVoiceNote('Record a voice note first.')
      return
    }
    try {
      await el.play()
      setVoiceNote(null)
    } catch (err) {
      setVoiceNote(err?.message || 'Playback failed.')
    }
  }

  return {
    isRecording,
    voiceNote,
    setVoiceNote,
    audioRef,
    toggleRecording,
    playRecording,
  }
}
