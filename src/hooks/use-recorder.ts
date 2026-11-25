"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_MS = 30_000;

function pickMime() {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
  return types.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) ?? "";
}

/** Microphone recording via MediaRecorder; resolves to a Blob when stopped (max 30s). */
export function useRecorder() {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const resolveRef = useRef<((b: Blob | null) => void) | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  /** Starts recording and returns a promise for the recording, resolved after stop(). */
  const start = useCallback(async (): Promise<Blob | null> => {
    setError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("mic_denied");
      return null;
    }
    const mimeType = pickMime();
    const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks: BlobPart[] = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    const done = new Promise<Blob | null>((resolve) => (resolveRef.current = resolve));
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      setRecording(false);
      resolveRef.current?.(chunks.length ? new Blob(chunks, { type: rec.mimeType || "audio/webm" }) : null);
    };
    recorderRef.current = rec;
    rec.start();
    setRecording(true);
    timerRef.current = setTimeout(stop, MAX_MS);
    return done;
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  return { recording, error, start, stop };
}
