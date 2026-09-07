import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerCustomElement = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  src?: string;
  alt?: string;
  "camera-controls"?: boolean | string;
  "auto-rotate"?: boolean | string;
  "shadow-intensity"?: string;
  scale?: string;
  loading?: "auto" | "lazy" | "eager";
  exposure?: string;
  "environment-image"?: string;
  poster?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerCustomElement;
    }
  }
}
