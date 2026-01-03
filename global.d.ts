/// <reference types="@types/google.maps" />

// Extend Window interface to include google maps
declare global {
  interface Window {
    google?: typeof google;
  }
}

export {};
