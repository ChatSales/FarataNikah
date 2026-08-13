"use client";

import { useRef, useState, useTransition } from "react";
import { Mic, Square, Send, Trash2 } from "lucide-react";
import { sendVoiceMessageAction } from "@/actions/messages";

export function VoiceRecorder({ conversationId }: { conversationId: string }) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(0);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        setAudioBlob(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      startTimeRef.current = Date.now();
      setRecording(true);
    } catch {
      setError("Impossible d'accéder au micro.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setDurationSeconds(Math.round((Date.now() - startTimeRef.current) / 1000));
    setRecording(false);
  }

  function discard() {
    setAudioBlob(null);
    setDurationSeconds(0);
    setError(null);
  }

  function send() {
    if (!audioBlob) return;
    const formData = new FormData();
    formData.set("conversationId", conversationId);
    formData.set("durationSeconds", String(durationSeconds));
    formData.set("audio", audioBlob, "voice-message.webm");
    startTransition(async () => {
      const result = await sendVoiceMessageAction(null, formData);
      if (result && "error" in result) {
        setError(result.error);
      } else {
        setAudioBlob(null);
        setDurationSeconds(0);
      }
    });
  }

  if (audioBlob) {
    return (
      <div className="flex flex-1 items-center gap-2 rounded-xl border border-primary-200 bg-cream-50 px-3 py-2">
        <audio controls src={URL.createObjectURL(audioBlob)} className="h-8 flex-1" />
        <span className="text-xs text-primary-900/60">{durationSeconds}s</span>
        <button
          type="button"
          onClick={discard}
          disabled={pending}
          className="text-primary-900/50 hover:text-red-600"
          aria-label="Supprimer l'enregistrement"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={send}
          disabled={pending}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-cream-50 transition hover:bg-primary-700 disabled:opacity-60"
          aria-label="Envoyer le message vocal"
        >
          <Send className="h-4 w-4" />
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={recording ? stopRecording : startRecording}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
          recording
            ? "bg-red-600 text-white"
            : "bg-primary-100 text-primary-700 hover:bg-primary-200"
        }`}
        aria-label={recording ? "Arrêter l'enregistrement" : "Enregistrer un message vocal"}
      >
        {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
