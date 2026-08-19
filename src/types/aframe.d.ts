import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type AFrameCustomElement = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> &
  Record<string, unknown>;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': AFrameCustomElement;
      'a-assets': AFrameCustomElement;
      'a-asset-item': AFrameCustomElement;
      'a-camera': AFrameCustomElement;
      'a-entity': AFrameCustomElement;
      'a-gltf-model': AFrameCustomElement;
    }
  }
}
