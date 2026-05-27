"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Camera, Loader2, X } from "lucide-react";

type Props = {
  onTokenDetected: (token: string) => void;
};

function extractToken(raw: string): string | null {
  // QR enthält entweder eine volle URL oder nur den Token
  try {
    const url = new URL(raw);
    const t = url.searchParams.get("token");
    if (t) return t;
  } catch {
    // kein gültiges URL-Format
  }
  // Direkter Token (kein URL-Format): prüfen ob "." enthalten (base64url.signature)
  if (raw.includes(".") && raw.length > 10) return raw.trim();
  return null;
}

export function CameraScanner({ onTokenDetected }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<"initializing" | "active" | "error">("initializing");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detected, setDetected] = useState(false);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const scanFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Lazy-load jsqr to avoid SSR issues
    const { default: jsQR } = await import("jsqr");
    const result = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (result?.data) {
      const token = extractToken(result.data);
      if (token && !detected) {
        setDetected(true);
        stopCamera();
        onTokenDetected(token);
        return;
      }
    }

    animFrameRef.current = requestAnimationFrame(scanFrame);
  }, [detected, onTokenDetected, stopCamera]);

  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setStatus("active");
        animFrameRef.current = requestAnimationFrame(scanFrame);
      } catch (err) {
        setStatus("error");
        setErrorMsg(
          err instanceof Error && err.name === "NotAllowedError"
            ? "Kamera-Zugriff verweigert. Bitte in den Browser-Einstellungen erlauben."
            : "Kamera konnte nicht gestartet werden.",
        );
      }
    }

    startCamera();

    return () => {
      active = false;
      stopCamera();
    };
  }, [scanFrame, stopCamera]);

  return (
    <div className="stack" style={{ alignItems: "center" }}>
      {status === "initializing" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "1rem" }}>
          <Loader2 className="spin" size={20} aria-hidden="true" />
          <span>Kamera wird gestartet…</span>
        </div>
      )}

      {status === "error" && (
        <div className="notice error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {status === "active" && !detected && (
        <>
          <p className="muted" style={{ textAlign: "center" }}>
            QR-Code in den Rahmen halten
          </p>
          <div style={{ position: "relative", width: "100%", maxWidth: 360 }}>
            <video
              ref={videoRef}
              muted
              playsInline
              style={{ width: "100%", borderRadius: 8, background: "#000" }}
            />
            {/* Scan-Rahmen */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "10%",
                border: "3px solid var(--color-accent, #16a34a)",
                borderRadius: 8,
                pointerEvents: "none",
              }}
            />
          </div>
        </>
      )}

      {detected && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "1rem" }}>
          <Camera size={20} aria-hidden="true" />
          <span>QR-Code erkannt, wird verarbeitet…</span>
        </div>
      )}

      {/* Hidden canvas für Analyse */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
