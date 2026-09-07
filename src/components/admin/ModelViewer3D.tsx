"use client";

import { useEffect, useState } from "react";
import { Box, Eye, Layers, RotateCcw, Sliders } from "lucide-react";

interface ModelViewer3DProps {
  modelUrl: string;
  initialScale?: string;
  onScaleChange?: (newScale: string) => void;
  showMarkerMockup?: boolean;
}

export default function ModelViewer3D({
  modelUrl,
  initialScale = "0.1 0.1 0.1",
  onScaleChange,
  showMarkerMockup = true,
}: ModelViewer3DProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  // Parse numeric scale from "0.1 0.1 0.1"
  const parseScale = (scaleStr: string): number => {
    const parts = scaleStr.trim().split(/\s+/);
    const val = parseFloat(parts[0]);
    return isNaN(val) ? 0.1 : val;
  };

  const [currentScaleNum, setCurrentScaleNum] = useState<number>(parseScale(initialScale));
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    // Load model-viewer module script if not already present
    const SCRIPT_ID = "model-viewer-script";
    if (document.getElementById(SCRIPT_ID)) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.type = "module";
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentScaleNum(val);
    const newScaleStr = `${val} ${val} ${val}`;
    if (onScaleChange) {
      onScaleChange(newScaleStr);
    }
  };

  const setPresetScale = (val: number) => {
    setCurrentScaleNum(val);
    const newScaleStr = `${val} ${val} ${val}`;
    if (onScaleChange) {
      onScaleChange(newScaleStr);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      {/* 3D Canvas Viewport */}
      <div className="relative h-80 sm:h-96 lg:h-[420px] w-full bg-slate-900 flex items-center justify-center">
        {scriptLoaded && modelUrl ? (
          <model-viewer
            src={modelUrl}
            alt="3D CIKASDA Model Preview"
            auto-rotate={autoRotate ? true : undefined}
            camera-controls
            shadow-intensity="1.2"
            scale={`${currentScaleNum} ${currentScaleNum} ${currentScaleNum}`}
            style={{ width: "100%", height: "100%", outline: "none" }}
          ></model-viewer>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Box className="h-8 w-8 animate-pulse text-teal-400" />
            <p className="text-xs">
              {modelUrl ? "Memuat WebGL 3D Canvas..." : "Pilih atau upload file .glb"}
            </p>
          </div>
        )}

        {/* View Controls Overlay */}
        <div className="absolute right-3 top-3 flex gap-1.5">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`rounded-md p-1.5 text-xs transition-colors ${
              autoRotate
                ? "bg-teal-700 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
            }`}
            title="Auto Rotate 360°"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Calibration Controls Footer */}
      <div className="border-t border-slate-200 bg-slate-50 p-3.5">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-3.5 w-3.5 text-teal-700" />
            <span className="text-xs font-semibold text-slate-800">
              Skala Objek:{" "}
              <span className="font-mono text-teal-800 font-bold">{currentScaleNum.toFixed(3)}</span>
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 mr-1">Preset:</span>
            {[0.05, 0.1, 0.2, 0.3].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setPresetScale(val)}
                className={`rounded px-2 py-0.5 text-xs font-mono font-semibold transition-colors border ${
                  Math.abs(currentScaleNum - val) < 0.005
                    ? "bg-teal-700 text-white border-teal-700"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Range Slider */}
        <div className="mt-2.5">
          <input
            type="range"
            min="0.01"
            max="0.5"
            step="0.005"
            value={currentScaleNum}
            onChange={handleSliderChange}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-teal-700"
          />
          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
            <span>0.01 (Sangat Kecil)</span>
            <span>0.25 (Sedang)</span>
            <span>0.50 (Besar)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
