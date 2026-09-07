"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

declare global {
  interface Window {
    AFRAME?: AFrameGlobal;
  }
}

type Vector3 = {
  x: number;
  y: number;
  z: number;
  set: (x: number, y: number, z: number) => void;
};

type AFrameElement = HTMLElement & {
  emit: (name: string, detail?: GestureEventDetail) => void;
  object3D: {
    rotation: Vector3;
    scale: Vector3;
  };
  sceneEl?: HTMLElement;
};

type AFrameComponentDefinition = {
  init?: (this: AFrameComponentInstance) => void;
  remove?: (this: AFrameComponentInstance) => void;
};

type AFrameComponentInstance = {
  el: AFrameElement;
  targetElement?: AFrameElement;
  initialScale?: number;
  scaleFactor?: number;
  handleOneFingerMove?: (event: Event) => void;
  handleTwoFingerMove?: (event: Event) => void;
  handleTouchStart?: (event: TouchEvent) => void;
  handleTouchMove?: (event: TouchEvent) => void;
  handleTouchEnd?: () => void;
  emitGestureEvent?: (name: string, detail: GestureEventDetail) => void;
  previousTouch?: TouchPoint | null;
  previousPinchDistance?: number | null;
};

type AFrameGlobal = {
  components: Record<string, unknown>;
  registerComponent: (
    name: string,
    definition: AFrameComponentDefinition,
  ) => void;
};

type TouchPoint = {
  x: number;
  y: number;
};

type GestureEventDetail = {
  positionChange?: TouchPoint;
  spreadChange?: number;
};

type GestureCustomEvent = CustomEvent<GestureEventDetail>;

const AFRAME_SCRIPT_ID = "aframe-runtime-script";
const MINDAR_SCRIPT_ID = "mindar-image-aframe-script";
const AFRAME_SCRIPT_URL = "https://aframe.io/releases/1.4.2/aframe.min.js";
const MINDAR_SCRIPT_URL =
  "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js";
const IMAGE_TARGET_URL = "/markers/targets.mind";

function loadScript(id: string, src: string) {
  return new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(
      id,
    ) as HTMLScriptElement | null;

    if (existingScript?.dataset.loaded === "true") {
      resolve();
      return;
    }

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error(`Gagal memuat script ${src}`)),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => reject(new Error(`Gagal memuat script ${src}`)),
      { once: true },
    );

    document.head.appendChild(script);
  });
}

function getTouchPoint(touch: Touch): TouchPoint {
  return {
    x: touch.clientX,
    y: touch.clientY,
  };
}

function getTouchDistance(firstTouch: Touch, secondTouch: Touch) {
  const deltaX = firstTouch.clientX - secondTouch.clientX;
  const deltaY = firstTouch.clientY - secondTouch.clientY;

  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

function registerGestureComponents() {
  const aframe = window.AFRAME;

  if (!aframe) {
    throw new Error("A-Frame belum siap.");
  }

  if (!aframe.components["gesture-detector"]) {
    aframe.registerComponent("gesture-detector", {
      init() {
        this.previousTouch = null;
        this.previousPinchDistance = null;

        this.emitGestureEvent = (name, detail) => {
          this.el.emit(name, detail);
        };

        this.handleTouchStart = (event) => {
          if (event.touches.length === 1) {
            this.previousTouch = getTouchPoint(event.touches[0]);
            this.previousPinchDistance = null;
          }

          if (event.touches.length === 2) {
            this.previousTouch = null;
            this.previousPinchDistance = getTouchDistance(
              event.touches[0],
              event.touches[1],
            );
          }
        };

        this.handleTouchMove = (event) => {
          if (event.touches.length === 1 && this.previousTouch) {
            event.preventDefault();

            const currentTouch = getTouchPoint(event.touches[0]);
            this.emitGestureEvent?.("onefingermove", {
              positionChange: {
                x: currentTouch.x - this.previousTouch.x,
                y: currentTouch.y - this.previousTouch.y,
              },
            });
            this.previousTouch = currentTouch;
          }

          if (event.touches.length === 2 && this.previousPinchDistance) {
            event.preventDefault();

            const currentDistance = getTouchDistance(
              event.touches[0],
              event.touches[1],
            );
            this.emitGestureEvent?.("twofingermove", {
              spreadChange: currentDistance - this.previousPinchDistance,
            });
            this.previousPinchDistance = currentDistance;
          }
        };

        this.handleTouchEnd = () => {
          this.previousTouch = null;
          this.previousPinchDistance = null;
        };

        this.el.addEventListener("touchstart", this.handleTouchStart, {
          passive: false,
        });
        this.el.addEventListener("touchmove", this.handleTouchMove, {
          passive: false,
        });
        this.el.addEventListener("touchend", this.handleTouchEnd);
        this.el.addEventListener("touchcancel", this.handleTouchEnd);
      },
      remove() {
        if (this.handleTouchStart) {
          this.el.removeEventListener("touchstart", this.handleTouchStart);
        }
        if (this.handleTouchMove) {
          this.el.removeEventListener("touchmove", this.handleTouchMove);
        }
        if (this.handleTouchEnd) {
          this.el.removeEventListener("touchend", this.handleTouchEnd);
          this.el.removeEventListener("touchcancel", this.handleTouchEnd);
        }
      },
    });
  }

  if (!aframe.components["gesture-handler"]) {
    aframe.registerComponent("gesture-handler", {
      init() {
        this.targetElement = this.el;
        this.initialScale = undefined;
        this.scaleFactor = 1;

        this.handleOneFingerMove = (event) => {
          const { positionChange } = (event as GestureCustomEvent).detail;

          if (!positionChange || !this.targetElement) {
            return;
          }

          this.targetElement.object3D.rotation.y += positionChange.x * 0.01;
          this.targetElement.object3D.rotation.x += positionChange.y * 0.005;
        };

        this.handleTwoFingerMove = (event) => {
          const { spreadChange } = (event as GestureCustomEvent).detail;

          if (!spreadChange || !this.targetElement) {
            return;
          }

          if (this.initialScale === undefined) {
            this.initialScale = this.targetElement.object3D.scale.x || 0.1;
            this.scaleFactor = 1;
          }

          const currentScaleFactor = this.scaleFactor ?? 1;
          this.scaleFactor = Math.min(
            5,
            Math.max(0.2, currentScaleFactor + spreadChange / 250),
          );

          const nextScale = (this.initialScale ?? 0.1) * this.scaleFactor;
          this.targetElement.object3D.scale.set(
            nextScale,
            nextScale,
            nextScale,
          );
        };

        this.el.sceneEl?.addEventListener(
          "onefingermove",
          this.handleOneFingerMove,
        );
        this.el.sceneEl?.addEventListener(
          "twofingermove",
          this.handleTwoFingerMove,
        );
      },
      remove() {
        if (this.handleOneFingerMove) {
          this.el.sceneEl?.removeEventListener(
            "onefingermove",
            this.handleOneFingerMove,
          );
        }
        if (this.handleTwoFingerMove) {
          this.el.sceneEl?.removeEventListener(
            "twofingermove",
            this.handleTwoFingerMove,
          );
        }
      },
    });
  }

  if (!aframe.components["marker-listener"]) {
    aframe.registerComponent("marker-listener", {
      init() {
        // Fungsi helper aman untuk mengambil angka targetIndex
        const getIndex = (el: HTMLElement): number | null => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const raw: any = el.getAttribute("mindar-image-target");
          if (!raw) return null;

          // Jika A-Frame mengembalikannya sebagai Objek { targetIndex: 0 }
          if (typeof raw === "object" && "targetIndex" in raw) {
            return Number(raw.targetIndex);
          }

          // Jika A-Frame mengembalikannya sebagai String "targetIndex: 0"
          if (typeof raw === "string") {
            const matchResult = raw.match(/\d+/);
            return matchResult ? Number(matchResult[0]) : null;
          }

          return null;
        };

        this.el.addEventListener("targetFound", () => {
          const targetIndex = getIndex(this.el);
          if (targetIndex !== null) {
            window.dispatchEvent(
              new CustomEvent("marker-found", { detail: { targetIndex } }),
            );
          }
        });

        this.el.addEventListener("targetLost", () => {
          const targetIndex = getIndex(this.el);
          if (targetIndex !== null) {
            window.dispatchEvent(
              new CustomEvent("marker-lost", { detail: { targetIndex } }),
            );
          }
        });
      },
    });
  }
}

interface ARViewerProps {
  activeTargetIndex: number | null;
  setActiveTargetIndex: (index: number | null) => void;
}

export default function ARViewer({
  activeTargetIndex,
  setActiveTargetIndex,
}: ARViewerProps) {
  const { models, t } = useLanguage();
  const sceneRef = useRef<AFrameElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scriptsReady, setScriptsReady] = useState(false);

  useEffect(() => {
    const handleMarkerFound = (e: Event) =>
      setActiveTargetIndex((e as CustomEvent).detail.targetIndex);

    const handleMarkerLost = () => {
      setActiveTargetIndex(null);
    };

    window.addEventListener("marker-found", handleMarkerFound);
    window.addEventListener("marker-lost", handleMarkerLost);

    return () => {
      window.removeEventListener("marker-found", handleMarkerFound);
      window.removeEventListener("marker-lost", handleMarkerLost);
    };
  }, [setActiveTargetIndex]);

  useEffect(() => {
    let mounted = true;

    async function prepareAR() {
      try {
        if (!window.isSecureContext) {
          throw new Error(
            "Kamera hanya bisa dibuka dari localhost atau HTTPS.",
          );
        }

        await loadScript(AFRAME_SCRIPT_ID, AFRAME_SCRIPT_URL);
        await loadScript(MINDAR_SCRIPT_ID, MINDAR_SCRIPT_URL);
        registerGestureComponents();

        if (mounted) {
          setScriptsReady(true);
        }
      } catch (error) {
        if (mounted) {
          console.error(
            error instanceof Error
              ? error.message
              : "Gagal menyiapkan WebAR di browser ini.",
          );
        }
      }
    }

    prepareAR();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!scriptsReady) return;

    let cancelled = false;
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch {
        console.error("Izin kamera ditolak.");
      }
    }
    startCamera();
    return () => {
      cancelled = true;
    };
  }, [scriptsReady]);

  // Memulai sistem MindAR secara aman setelah scene A-Frame selesai dimuat
  useEffect(() => {
    if (!scriptsReady) return;

    const scene = sceneRef.current;
    if (!scene) return;

    const startARWhenLoaded = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const arSystem = (scene as any).systems?.["mindar-image-system"];
      if (arSystem && !arSystem.started) {
        console.log("[ARViewer] Starting MindAR system...");
        try {
          arSystem.start();
          console.log("[ARViewer] MindAR system started successfully (synchronous)");
        } catch (err) {
          console.error("[ARViewer] Failed to start MindAR (synchronous):", err);
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((scene as any).hasLoaded) {
      startARWhenLoaded();
    } else {
      scene.addEventListener("loaded", startARWhenLoaded, { once: true });
    }

    return () => {
      scene.removeEventListener("loaded", startARWhenLoaded);
    };
  }, [scriptsReady]);

  return (
    <section className="relative h-full min-h-[320px] w-full overflow-hidden rounded-[22px] bg-black text-white">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        playsInline
      />
      {scriptsReady ? (
        <>
          <a-scene
            ref={sceneRef}
            mindar-image={`imageTargetSrc: ${IMAGE_TARGET_URL}; autoStart: false; uiScanning: no; uiLoading: no; uiError: no;`}
            color-space="sRGB"
            renderer="colorManagement: true; alpha: true; antialias: true"
            vr-mode-ui="enabled: false"
            device-orientation-permission-ui="enabled: false"
            embedded
            gesture-detector=""
            class="absolute inset-0 z-10 block h-full w-full"
            style={{ height: "100%", width: "100%", background: "transparent" }}
          >
            {/* DAFTARKAN ASSET MODEL SECARA DINAMIS */}
            <a-assets timeout="10000">
              {models.map((item) => (
                <a-asset-item
                  key={`asset-${item.id}`}
                  id={`model-${item.id}`}
                  src={item.modelUrl}
                ></a-asset-item>
              ))}
            </a-assets>

            <a-camera
              position="0 0 0"
              look-controls="enabled: false"
            ></a-camera>

            {/* DAFTARKAN TARGET MARKER DAN MODEL 3D */}
            {models.map((item, index) => (
              <a-entity
                key={`target-${item.id}`}
                mindar-image-target={`targetIndex: ${index}`}
                marker-listener=""
              >
                <a-entity light="type: ambient; intensity: 1.2"></a-entity>
                <a-entity
                  light="type: directional; intensity: 0.8"
                  position="0 1 1"
                ></a-entity>
                <a-gltf-model
                  src={`#model-${item.id}`}
                  position="0 0 0"
                  scale={item.scale}
                  rotation="0 0 0"
                  gesture-handler=""
                ></a-gltf-model>
              </a-entity>
            ))}
          </a-scene>

          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4">
            <div className="rounded-full bg-black/55 px-4 py-2 text-center text-xs text-white/85">
              {t.rotateGesture} · {t.zoomGesture}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
