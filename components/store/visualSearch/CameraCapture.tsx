import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, RefreshCcw, Upload } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onFallbackUpload?: (dataUrl: string) => void;
  onError?: (message: string) => void;
  isProcessing?: boolean;
}

const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    facingMode: { ideal: 'environment' },
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
  audio: false,
};

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onFallbackUpload,
  onError,
  isProcessing = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const startCamera = async () => {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setPermissionDenied(true);
        onError?.('Camera access is not supported in this browser.');
        setInitializing(false);
        return;
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);
        if (!isMounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play().catch(() => undefined);
        }
      } catch (error: any) {
        console.error('Camera initialization failed', error);
        setPermissionDenied(true);
        onError?.(
          error?.name === 'NotAllowedError'
            ? 'Camera permission denied. You can upload an image instead.'
            : 'Unable to access the camera. Try uploading an image instead.'
        );
      } finally {
        if (isMounted) setInitializing(false);
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [onError]);

  const handleVideoReady = () => setIsReady(true);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      onError?.('Failed to capture frame. Please try again.');
      return;
    }

    context.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onCapture(dataUrl);
  }, [onCapture, onError]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : '';
        if (!dataUrl) {
          onError?.('Could not read the uploaded image.');
          return;
        }
        if (onFallbackUpload) {
          onFallbackUpload(dataUrl);
        } else {
          onCapture(dataUrl);
        }
      };
      reader.onerror = () => onError?.('Image upload failed. Try a different file.');
      reader.readAsDataURL(file);
    },
    [onCapture, onError, onFallbackUpload]
  );

  const renderOverlay = () => {
    if (initializing) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 text-white gap-3">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm font-medium tracking-wide">Initializing camera…</p>
        </div>
      );
    }

    if (permissionDenied) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 text-white gap-4 px-6 text-center">
          <ImagePlus className="h-12 w-12" />
          <div>
            <p className="text-base font-semibold">Camera unavailable</p>
            <p className="text-sm text-white/70 mt-1">Grant camera permission or use the upload option below.</p>
          </div>
        </div>
      );
    }

    if (!isReady) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 text-white gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-xs tracking-wide uppercase">Waiting for live preview…</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-lg">
      <video
        ref={videoRef}
        onCanPlay={handleVideoReady}
        playsInline
        muted
        autoPlay
        className="h-[320px] w-full object-cover md:h-full"
      />
      {renderOverlay()}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent">
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={isProcessing || initializing || permissionDenied}
            onClick={captureFrame}
            className="group flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Capture photo"
          >
            {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.3em] text-white/70">
          <span className="flex items-center gap-1"><RefreshCcw className="h-3.5 w-3.5" /> Align product center</span>
          <span className="h-[1px] w-8 bg-white/30" />
          <span>Tap to scan</span>
        </div>
        <label className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur-md transition hover:bg-white/25 cursor-pointer">
          <Upload className="h-4 w-4" /> Upload photo
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>
    </div>
  );
};

export default CameraCapture;
