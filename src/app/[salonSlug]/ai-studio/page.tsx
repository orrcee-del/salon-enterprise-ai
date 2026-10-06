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
  } from 'lucide-react';

type StudioMode = 'nails' | 'hair' | 'lashes';

function AIStudioContent() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.salonSlug as string) || 'legends-barbershop-avondale';

  const [mode, setMode] = useState<StudioMode>('nails');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // --- 1. NAILS TRY-ON STATE ---
  const [nailShape, setNailShape] = useState<'Almond' | 'Coffin' | 'Stiletto' | 'Square'>('Almond');
  const [nailColor, setNailColor] = useState<{ name: string; hex: string; style: string }>({
    name: 'Glazed Donut Chrome',
    hex: '#f5ebe0',
    style: 'chrome',
  });
  const [nailLength, setNailLength] = useState<'Short' | 'Medium' | 'Long'>('Medium');

  // --- 2. HAIR & BEARD STATE ---
  const [faceShape, setFaceShape] = useState<'Square' | 'Round' | 'Oval' | 'Diamond'>('Square');
  const [selectedHairStyle, setSelectedHairStyle] = useState<string>('High Skin Fade + Textured Crop');

  // --- 3. LASH & BROW STATE ---
  const [eyeShape] = useState<string>('Almond / Hooded Crease');
  const [maxSafeLash] = useState<number>(13); // 13mm
  const [lashMapping] = useState<string>('Cat-Eye Hybrid (9mm inner -> 13mm outer)');
  const [browRecommendation] = useState<string>('Soft Micro-Ombré Arch');

  // Camera Activation
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
        console.warn('Camera permission denied or camera not found:', err);
        setCameraActive(false);
      }
    }

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleScanAnalysis = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  const handleBookSelectedLook = () => {
    let queryParam = '';
    if (mode === 'nails') {
      queryParam = `?tryon=nails&style=${encodeURIComponent(nailShape)}&color=${encodeURIComponent(nailColor.name)}&length=${nailLength}`;
    } else if (mode === 'hair') {
      queryParam = `?tryon=hair&style=${encodeURIComponent(selectedHairStyle)}&shape=${faceShape}`;
    } else {
      queryParam = `?tryon=lashes&style=${encodeURIComponent(lashMapping)}&maxMm=${maxSafeLash}`;
    }
    router.push(`/${slug}/book${queryParam}`);
  };

  const NAIL_PALETTE = [
    { name: 'Nude Pearl (Natural)', hex: '#e8d8c8', style: 'cream' },
    { name: 'Classic French Tip', hex: '#ffffff', style: 'french' },
    { name: 'Glazed Donut Chrome', hex: '#fbf0f0', style: 'chrome' },
    { name: 'Burgundy Wine Velvet', hex: '#58111a', style: 'gloss' },
    { name: 'Midnight Onyx Gloss', hex: '#1a1a1a', style: 'gloss' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur sticky top-0 z-40 px-4 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href={`/${slug}`}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Salon
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-extrabold text-white text-sm">TrimFlow AI Beauty Studio</span>
          </div>
          <button
            onClick={handleScanAnalysis}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 font-semibold flex items-center gap-1.5 transition-all border border-neutral-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-amber-400' : ''}`} />
            {isScanning ? 'Scanning...' : 'Re-Scan'}
          </button>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="max-w-4xl mx-auto w-full px-4 py-6 space-y-6 flex-1">
        {/* Studio Mode Selector Pills */}
        <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-neutral-900 border border-neutral-800 max-w-md mx-auto">
          <button
            onClick={() => setMode('nails')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'nails'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            💅 Virtual Nails (Hand)
          </button>

          <button
            onClick={() => setMode('hair')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'hair'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            ✂️ Hair & Beard (Face)
          </button>

          <button
            onClick={() => setMode('lashes')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'lashes'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            👁️ Lashes & Brows
          </button>
        </div>

        {/* Live Camera Viewport Box */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full max-w-2xl mx-auto rounded-3xl overflow-hidden bg-neutral-900 border-2 border-neutral-800 shadow-2xl flex items-center justify-center">
          {cameraActive ? (
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
                  ? 'Hold your fingers up to your webcam or phone camera to test artificial nails.'
                  : mode === 'hair'
                  ? 'Position your face in the camera to scan jawline and forehead.'
                  : 'Look forward into the camera to scan eyelid-to-brow spacing.'}
              </p>
              <button
                onClick={() => setCameraActive(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-transform active:scale-95"
              >
                Enable Camera
              </button>
            </div>
          )}

          {/* MODE 1 OVERLAY: Virtual Artificial Nails Fitted on Hand */}
          {mode === 'nails' && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
              <div className="self-end px-3 py-1.5 rounded-full bg-neutral-950/80 backdrop-blur text-[11px] font-bold text-amber-400 border border-amber-500/30">
                Fitting {nailShape} • {nailLength} • {nailColor.name}
              </div>

              {/* Virtual Fingertip Fitting Guide (Simulated AR Overlay) */}
              <div className="flex justify-center items-end gap-5 pb-8">
                {[1, 2, 3, 4].map((finger) => (
                  <div key={finger} className="flex flex-col items-center gap-1 animate-pulse">
                    <div
                      style={{
                        backgroundColor: nailColor.hex,
                        borderRadius:
                          nailShape === 'Almond'
                            ? '50% 50% 15% 15%'
                            : nailShape === 'Coffin'
                            ? '15% 15% 5% 5%'
                            : nailShape === 'Stiletto'
                            ? '60% 60% 10% 10%'
                            : '6px 6px 0 0',
                        height: nailLength === 'Short' ? '32px' : nailLength === 'Medium' ? '46px' : '62px',
                        width: finger === 1 ? '16px' : finger === 4 ? '13px' : '18px',
                      }}
                      className="shadow-lg border border-black/40"
                    />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80"></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODE 2 OVERLAY: Hair & Beard Face Analysis Grid */}
          {mode === 'hair' && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
              <div className="self-start px-3 py-1.5 rounded-full bg-neutral-950/80 backdrop-blur text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                Face Shape Detected: {faceShape}
              </div>

              {/* Face Guide Oval */}
              <div className="border-2 border-dashed border-amber-500/40 w-48 h-64 rounded-[50%] mx-auto self-center opacity-60"></div>

              <div className="self-center px-4 py-2 rounded-2xl bg-neutral-950/90 backdrop-blur text-xs text-white border border-neutral-800 text-center">
                <span className="text-amber-400 font-bold block">Top Recommendation:</span>
                {selectedHairStyle}
              </div>
            </div>
          )}

          {/* MODE 3 OVERLAY: Lash & Brow Safe Dimension Ruler */}
          {mode === 'lashes' && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
              <div className="self-end px-3 py-1.5 rounded-full bg-neutral-950/80 backdrop-blur text-[11px] font-bold text-purple-400 border border-purple-500/30">
                Lash Safety Limit: {maxSafeLash}mm MAX
              </div>

              {/* Eye-to-brow ruler simulation */}
              <div className="mx-auto self-center p-4 rounded-2xl bg-neutral-950/90 border border-purple-500/30 space-y-2 text-center max-w-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 block">
                  Eye Contour Analysis
                </span>
                <p className="text-xs text-white font-semibold">{eyeShape}</p>
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200">
                  ⚠️ Lashes longer than {maxSafeLash}mm will cause lid droop. We recommend:
                  <strong className="block text-white mt-1">{lashMapping}</strong>
                </div>
                <p className="text-[10px] text-neutral-400">Brow Arch: {browRecommendation}</p>
              </div>

              <div></div>
            </div>
          )}
        </div>

        {/* CONTROLS PER MODE */}
        <div className="max-w-2xl mx-auto p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6">
          {/* Controls for Nails */}
          {mode === 'nails' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-2">
                  1. Choose Artificial Nail Shape
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Almond', 'Coffin', 'Stiletto', 'Square'] as const).map((shape) => (
                    <button
                      key={shape}
                      onClick={() => setNailShape(shape)}
                      className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all ${
                        nailShape === shape
                          ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-2">
                  2. Pick Gel Shade / Finish
                </label>
                <div className="flex flex-wrap gap-2">
                  {NAIL_PALETTE.map((pal) => (
                    <button
                      key={pal.name}
                      onClick={() => setNailColor(pal)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-2 transition-all ${
                        nailColor.name === pal.name
                          ? 'bg-white text-neutral-950 border-white font-bold'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/40"
                        style={{ backgroundColor: pal.hex }}
                      />
                      {pal.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-2">
                  3. Extension Length
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Short', 'Medium', 'Long'] as const).map((len) => (
                    <button
                      key={len}
                      onClick={() => setNailLength(len)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        nailLength === len
                          ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Controls for Hair & Beard */}
          {mode === 'hair' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-2">
                  Face Shape Adjustment
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Square', 'Round', 'Oval', 'Diamond'] as const).map((shp) => (
                    <button
                      key={shp}
                      onClick={() => {
                        setFaceShape(shp);
                        if (shp === 'Square') setSelectedHairStyle('High Skin Fade + Textured Crop');
                        if (shp === 'Round') setSelectedHairStyle('High Top Fade + Angular Beard');
                        if (shp === 'Oval') setSelectedHairStyle('Classic Taper + Beard Sculpt');
                        if (shp === 'Diamond') setSelectedHairStyle('Medium Scissor Cut + Boxed Beard');
                      }}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        faceShape === shp
                          ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      {shp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Controls for Lashes & Brows */}
          {mode === 'lashes' && (
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-xs font-bold text-purple-400 block">
                Technician Lash Map Coordinates
              </span>
              <p className="text-xs text-neutral-300">
                Safe length limit: <strong>{maxSafeLash}mm</strong> • Recommended Curl: <strong>D-Curl</strong>
              </p>
              <p className="text-xs text-neutral-400">
                This exact map will be forwarded to your lash tech upon booking!
              </p>
            </div>
          )}

          {/* Final Action CTA Button */}
          <button
            onClick={handleBookSelectedLook}
            className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <span>Book This Look with Our Techs</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
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