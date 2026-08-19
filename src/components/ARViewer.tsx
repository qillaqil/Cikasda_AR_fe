'use client';

import { useEffect, useRef, useState } from 'react';

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

const AFRAME_SCRIPT_ID = 'aframe-runtime-script';
const MINDAR_SCRIPT_ID = 'mindar-image-aframe-script';
const AFRAME_SCRIPT_URL = 'https://aframe.io/releases/1.5.0/aframe.min.js';
const MINDAR_SCRIPT_URL =
  'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js';
const IMAGE_TARGET_URL =
  '/markers/targets.mind';
const MODEL_URL =
  'https://cdn.aframe.io/test-models/models/glTF-2.0/Duck/glTF-Binary/Duck.glb';

function loadScript(id: string, src: string) {
  return new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(id) as HTMLScriptElement | null;

    if (existingScript?.dataset.loaded === 'true') {
      resolve();
      return;
    }

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener(
        'error',
        () => reject(new Error(`Gagal memuat script ${src}`)),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolve();
      },
      { once: true },
    );
    script.addEventListener(
      'error',
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
    throw new Error('A-Frame belum siap.');
  }

  if (!aframe.components['gesture-detector']) {
    aframe.registerComponent('gesture-detector', {
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
            this.emitGestureEvent?.('onefingermove', {
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
            this.emitGestureEvent?.('twofingermove', {
              spreadChange: currentDistance - this.previousPinchDistance,
            });
            this.previousPinchDistance = currentDistance;
          }
        };

        this.handleTouchEnd = () => {
          this.previousTouch = null;
          this.previousPinchDistance = null;
        };

        this.el.addEventListener('touchstart', this.handleTouchStart, {
          passive: false,
        });
        this.el.addEventListener('touchmove', this.handleTouchMove, {
          passive: false,
        });
        this.el.addEventListener('touchend', this.handleTouchEnd);
        this.el.addEventListener('touchcancel', this.handleTouchEnd);
      },
      remove() {
        if (this.handleTouchStart) {
          this.el.removeEventListener('touchstart', this.handleTouchStart);
        }
        if (this.handleTouchMove) {
          this.el.removeEventListener('touchmove', this.handleTouchMove);
        }
        if (this.handleTouchEnd) {
          this.el.removeEventListener('touchend', this.handleTouchEnd);
          this.el.removeEventListener('touchcancel', this.handleTouchEnd);
        }
      },
    });
  }

  if (!aframe.components['gesture-handler']) {
    aframe.registerComponent('gesture-handler', {
      init() {
        this.targetElement = this.el;
        this.initialScale = this.el.object3D.scale.x || 0.1;
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

          if (!spreadChange || !this.targetElement || !this.initialScale) {
            return;
          }

          this.scaleFactor = Math.min(
            5,
            Math.max(0.5, (this.scaleFactor || 1) + spreadChange / 250),
          );

          const nextScale = this.initialScale * this.scaleFactor;
          this.targetElement.object3D.scale.set(nextScale, nextScale, nextScale);
        };

        this.el.sceneEl?.addEventListener(
          'onefingermove',
          this.handleOneFingerMove,
        );
        this.el.sceneEl?.addEventListener(
          'twofingermove',
          this.handleTwoFingerMove,
        );
      },
      remove() {
        if (this.handleOneFingerMove) {
          this.el.sceneEl?.removeEventListener(
            'onefingermove',
            this.handleOneFingerMove,
          );
        }
        if (this.handleTwoFingerMove) {
          this.el.sceneEl?.removeEventListener(
            'twofingermove',
            this.handleTwoFingerMove,
          );
        }
      },
    });
  }
}

export default function ARViewer() {
  const sceneRef = useRef<AFrameElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [scriptsReady, setScriptsReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function prepareAR() {
      try {
        if (!window.isSecureContext) {
          throw new Error(
            'Kamera hanya bisa dibuka dari localhost atau HTTPS.',
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
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Gagal menyiapkan WebAR di browser ini.',
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
    if (!scriptsReady) {
      return;
    }

    let cancelled = false;

    async function startCameraPreview() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        cameraStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        // MindAR still owns the AR camera; this preview is only the visible background.
      }
    }

    startCameraPreview();

    return () => {
      cancelled = true;
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    };
  }, [scriptsReady]);

  useEffect(() => {
    if (!scriptsReady) {
      return;
    }

    const scene = sceneRef.current;
    if (!scene) {
      return;
    }

    const markCameraReady = () => {
      setCameraReady(true);
    };

    const handleArError = (event: Event) => {
      const error = event as CustomEvent<{ error?: Error }>;
      setLoadError(
        error.detail?.error?.message ||
          'Tracking AR gagal dimulai.',
      );
    };

    scene.addEventListener('arReady', markCameraReady, { once: true });
    scene.addEventListener('arError', handleArError);

    return () => {
      scene.removeEventListener('arReady', markCameraReady);
      scene.removeEventListener('arError', handleArError);
    };
  }, [scriptsReady]);

  return (
    <section className="relative h-full min-h-[320px] w-full overflow-hidden rounded-[22px] bg-black text-white">
      {(!scriptsReady || !cameraReady) && !loadError ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/85 px-6 text-center">
          <div>
            <p className="text-lg font-semibold">
              {scriptsReady ? 'Menyalakan kamera...' : 'Menyiapkan WebAR...'}
            </p>
          </div>
        </div>
      ) : null}

      {loadError ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black px-6 text-center">
          <div className="max-w-sm rounded-2xl border border-red-400/40 bg-red-950/60 p-5 shadow-2xl">
            <p className="text-lg font-semibold text-red-100">WebAR gagal dimuat</p>
            <p className="mt-2 text-sm text-red-100/80">{loadError}</p>
          </div>
        </div>
      ) : null}

      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: 'none', backdropFilter: 'none', WebkitBackdropFilter: 'none' }}
        autoPlay
        muted
        playsInline
      />

      {scriptsReady ? (
        <>
          <a-scene
            ref={sceneRef}
            mindar-image={`imageTargetSrc: ${IMAGE_TARGET_URL}; autoStart: true; uiScanning: yes; uiLoading: yes; uiError: yes;`}
            color-space="sRGB"
            renderer="colorManagement: true; alpha: true; antialias: true"
            vr-mode-ui="enabled: false"
            device-orientation-permission-ui="enabled: false"
            embedded
            gesture-detector=""
            class="absolute inset-0 z-10 block h-full w-full"
            style={{ height: '100%', width: '100%', background: 'transparent' }}
          >
            <a-assets timeout="10000">
              <a-asset-item id="mosque-model" src={MODEL_URL}></a-asset-item>
            </a-assets>

            <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

            <a-entity mindar-image-target="targetIndex: 0">
              <a-entity light="type: ambient; intensity: 1.2"></a-entity>
              <a-entity
                light="type: directional; intensity: 0.8"
                position="0 1 1"
              ></a-entity>
              <a-gltf-model
                src="#mosque-model"
                position="0 0 0"
                scale="0.1 0.1 0.1"
                rotation="0 0 0"
                gesture-handler=""
              ></a-gltf-model>
            </a-entity>
          </a-scene>

          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4">
            <div className="rounded-full bg-black/55 px-4 py-2 text-center text-xs text-white/85">
              Geser satu jari untuk rotate · Cubit dua jari untuk zoom
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
