/// <reference types="vite/client" />

import type { TypefolioDesktopApi } from "../../preload/index";

declare global {
  interface Window {
    typefolioDesktop: TypefolioDesktopApi;
  }
}

export {};
