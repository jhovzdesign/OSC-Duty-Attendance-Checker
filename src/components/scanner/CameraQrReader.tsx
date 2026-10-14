import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';

interface CameraQrReaderProps {
  onScan: (decodedText: string) => void;
  active: boolean;
}

export const CameraQrReader: React.FC<CameraQrReaderProps> = ({ onScan, active }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const lastScannedTime = useRef<number>(0);

  // Initialize camera stream
  useEffect(() => {
    if (!active) {
      stopCamera();
      return;
    }

    let isMounted = true;

    async function startCamera() {
      try {
        setErrorMessage('');
        stopCamera();

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        setStream(mediaStream);
        setHasPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(e => console.warn('Video play error:', e));
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const e = err as Error;
        console.warn('Camera access error:', e);
        setHasPermission(false);
        setErrorMessage(
          e.name === 'NotAllowedError'
            ? 'Camera access permission was denied. Please allow camera permissions in your browser.'
            : 'No camera hardware found or video stream is unavailable.'
        );
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [active, facingMode]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Barcode / QR detection loop
  useEffect(() => {
    if (!active || !stream || !hasPermission) return;

    let animationFrameId: number;
    let detector: any = null;

    if ('BarcodeDetector' in window) {
      try {
        detector = new (window as any).BarcodeDetector({
          formats: ['qr_code', 'code_128', 'code_39', 'data_matrix'],
        });
      } catch {
        detector = null;
      }
    }

    const checkFrame = async () => {
      const now = Date.now();
      // Debounce detections (at least 2 seconds between repeated triggers)
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        if (now - lastScannedTime.current > 2000) {
          if (detector) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0 && barcodes[0].rawValue) {
                lastScannedTime.current = now;
                setIsScanning(true);
                setTimeout(() => setIsScanning(false), 800);
                onScan(barcodes[0].rawValue);
              }
            } catch {
              // Ignore frame errors
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(checkFrame);
    };

    animationFrameId = requestAnimationFrame(checkFrame);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, stream, hasPermission, onScan]);

  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="relative w-full aspect-[4/3] max-w-md mx-auto bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
      {hasPermission === false ? (
        <div className="p-6 text-center text-slate-300 space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-700/50 flex items-center justify-center mx-auto text-red-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-200">{errorMessage}</p>
          <p className="text-xs text-slate-400">
            You can still use manual verification, barcode lookup, or quick badge simulation below.
          </p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Institutional Scanner Reticle Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Darkened Mask edges */}
            <div className="absolute inset-0 bg-slate-950/35 backdrop-brightness-95"></div>

            {/* Clear target viewport */}
            <div className="relative w-64 h-64 border-2 border-dashed border-blue-400/80 rounded-2xl overflow-hidden shadow-[0_0_0_9999px_rgba(15,23,42,0.55)]">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500"></div>

              {/* Laser scanning sweep line */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-[bounce_2.5s_infinite]"></div>

              {/* Status Indicator */}
              <div className="absolute bottom-3 left-0 right-0 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900/80 text-[11px] font-mono text-cyan-300 tracking-wider uppercase border border-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Align Duty QR Code
                </span>
              </div>
            </div>
          </div>

          {/* Top Controls Overlay */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              onClick={toggleCamera}
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors shadow-md backdrop-blur-sm"
              title="Switch Camera (Front/Rear)"
              type="button"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {isScanning && (
            <div className="absolute inset-0 bg-blue-500/20 border-4 border-blue-400 flex items-center justify-center transition-opacity">
              <span className="px-4 py-2 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-lg">
                Decoded Duty Token...
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
