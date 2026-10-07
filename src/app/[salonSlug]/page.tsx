// src/app/[salonSlug]/ai-studio/page.tsx
'use client';

import React, { Suspense, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Camera,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { VisualRecommendation } from '@/app/api/ai/visual-tryon/route';

type StudioMode = 'nails' | 'hair' | 'lashes';

function AIStudioContent() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.salonSlug as string) || 'legends-barbershop-avondale';

  const [mode, setMode] = useState<StudioMode>('nails');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<VisualRecommendation[]>([]);
  const [selectedLook, setSelectedLook] = useState<VisualRecommendation | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize camera feed
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function initCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        console.warn('Camera access unavailable:', err);
        setCameraActive(false);
      }
    }

    if (!capturedPhoto) {
      initCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [capturedPhoto]);

  // Capture frame from video onto an invisible canvas
  const handleCaptureAndGenerate = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontal so it matches mirror perspective
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(base64Image);
    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/ai/visual-tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          mode,
        }),
      });

      const data = await res.json();
      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
        setSelectedLook(data.recommendations[0]);
      }
    } catch (err) {
      console.error('AI try-on error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setRecommendations([]);
    setSelectedLook(null);
  };

  const handleBookChosenLook = () => {
    if (!selectedLook) return;
    const query = `?tryon=${selectedLook.category}&style=${encodeURIComponent(
      selectedLook.title
    )}&shade=${encodeURIComponent(selectedLook.shade)}`;
    router.push(`/${slug}/book${query}`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur sticky top-0 z-40 px-4 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href={`/${slug}`}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Salon
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-extrabold text-white text-sm">TrimFlow AI Visual Studio</span>
          </div>
          {capturedPhoto && (
            <button
              onClick={handleRetake}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 font-semibold flex items-center gap-1.5 transition-all border border-neutral-700"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              Retake Photo
            </button>
          )}
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="max-w-5xl mx-auto w-full px-4 py-6 space-y-6 flex-1">
        {/* Department Mode Selector Pills */}
        <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-neutral-900 border border-neutral-800 max-w-md mx-auto">
          <button
            onClick={() => {
              setMode('nails');
              handleRetake();
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'nails'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            💅 Virtual Nails (Hand)
          </button>

          <button
            onClick={() => {
              setMode('hair');
              handleRetake();
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'hair'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            ✂️ Hair & Beard (Face)
          </button>

          <button
            onClick={() => {
              setMode('lashes');
              handleRetake();
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'lashes'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            👁️ Lashes & Brows
          </button>
        </div>

        {/* Viewport: Live Camera OR Captured Photo with Fitting */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full max-w-2xl mx-auto rounded-3xl overflow-hidden bg-neutral-900 border-2 border-neutral-800 shadow-2xl flex items-center justify-center">
          {capturedPhoto ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={capturedPhoto} alt="Captured Look" className="w-full h-full object-cover" />
          ) : cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
          ) : (
            <div className="text-center p-6 space-y-3">
              <Camera className="w-12 h-12 text-neutral-600 mx-auto animate-pulse" />
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                {mode === 'nails'
                  ? 'Hold your fingers up to your camera to take a photo and test artificial nails.'
                  : mode === 'hair'
                  ? 'Center your face in the camera frame to scan your face shape and hairline.'
                  : 'Look forward into the camera to scan eyelid-to-brow spacing.'}
              </p>
            </div>
          )}

          {/* AI Scanning Beam Overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-amber-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                AI Analyzing Undertones & Fitting 4 Styles...
              </p>
            </div>
          )}

          {/* Real-time Fitting Overlay onto the Photo */}
          {selectedLook && !isAnalyzing && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
              <div className="self-end px-3 py-1.5 rounded-full bg-neutral-950/90 backdrop-blur text-xs font-bold text-amber-400 border border-amber-500/40 flex items-center gap-1.5 shadow-lg">
                <Sparkles className="w-3.5 h-3.5" />
                {selectedLook.title} ({selectedLook.undertoneMatchScore}% Match)
              </div>

              {/* Virtual Nail Caps composited over fingers */}
              {mode === 'nails' && (
                <div className="flex justify-center items-end gap-5 pb-8">
                  {[1, 2, 3, 4].map((finger) => (
                    <div key={finger} className="flex flex-col items-center gap-1">
                      <div
                        style={{
                          backgroundColor: selectedLook.colorHex,
                          borderRadius: selectedLook.shape.includes('Almond')
                            ? '50% 50% 15% 15%'
                            : selectedLook.shape.includes('Coffin')
                            ? '15% 15% 5% 5%'
                            : selectedLook.shape.includes('Stiletto')
                            ? '60% 60% 10% 10%'
                            : '6px 6px 0 0',
                          height: '46px',
                          width: finger === 1 ? '16px' : finger === 4 ? '13px' : '18px',
                        }}
                        className="shadow-2xl border border-black/40"
                      />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Snap Photo Shutter Button (Visible when camera is active and no photo taken yet) */}
          {!capturedPhoto && cameraActive && (
            <div className="absolute bottom-6 inset-x-0 flex justify-center">
              <button
                onClick={handleCaptureAndGenerate}
                className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-sm shadow-2xl shadow-amber-500/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Snap & Generate AI Looks</span>
              </button>
            </div>
          )}
        </div>

        {/* 4 GENERATED OUTCOME CARDS (The User Picks the Best One) */}
        {recommendations.length > 0 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  Pick The Outcome That Fits You Most
                </h3>
                <p className="text-xs text-neutral-400">
                  Tap any card below to see it fitted onto your photo above.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400">4 Styles Generated</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {recommendations.map((rec) => {
                const isSelected = selectedLook?.id === rec.id;
                return (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedLook(rec)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
                        : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-amber-400">
                          {rec.shape}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {rec.undertoneMatchScore}% Match
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-neutral-700 flex-shrink-0"
                          style={{ backgroundColor: rec.colorHex }}
                        />
                        <h4 className="text-xs font-bold text-white leading-tight">{rec.title}</h4>
                      </div>

                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        {rec.stylistNote}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-neutral-500">{rec.shade}</span>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-600'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Booking Confirmation CTA */}
            {selectedLook && (
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Selected Look Ready
                  </span>
                  <h4 className="text-sm font-bold text-white">{selectedLook.title}</h4>
                  <p className="text-xs text-neutral-400">
                    This photo and formula will be attached to your appointment ticket for your stylist.
                  </p>
                </div>

                <button
                  onClick={handleBookChosenLook}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 whitespace-nowrap transition-transform active:scale-95"
                >
                  <span>Book with This Selected Look</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AIBeautyStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <AIStudioContent />
    </Suspense>
  );
}