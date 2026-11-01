import { useState, useEffect } from 'react';
import { ThemePalette } from '../types/music';

export const DEFAULT_THEME: ThemePalette = {
  primary: '#10b981', // Emerald
  accent: '#06b6d4',  // Cyan
  backgroundGlow: 'rgba(16, 185, 129, 0.22)',
  surfaceColor: '#0c0f0e',
  lightGlow: 'rgba(6, 182, 212, 0.16)',
  isDynamic: false
};

const paletteCache = new Map<string, ThemePalette>();

// Fast offscreen pixel sampling to extract vibrant color and complementary accent
export function extractPaletteFromImage(imgUrl: string): Promise<ThemePalette> {
  if (paletteCache.has(imgUrl)) {
    return Promise.resolve(paletteCache.get(imgUrl)!);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const fallback: ThemePalette = { ...DEFAULT_THEME, isDynamic: true };

    const timer = setTimeout(() => {
      resolve(fallback);
    }, 1500);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(fallback);
          return;
        }

        const size = 36;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size).data;
        let rSum = 0, gSum = 0, bSum = 0;
        let maxVibrancy = -1;
        let vibrantR = 16, vibrantG = 185, vibrantB = 129;
        let secondR = 6, secondG = 182, secondB = 212;
        let validSamples = 0;

        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue;

          // Skip nearly black and nearly white pixels
          const maxVal = Math.max(r, g, b);
          const minVal = Math.min(r, g, b);
          const delta = maxVal - minVal;
          const lightness = (maxVal + minVal) / 2;

          if (lightness < 25 || lightness > 235) continue;

          // Saturation / Vibrancy metric
          const vibrancy = delta * (1 - Math.abs(lightness - 128) / 128);

          if (vibrancy > maxVibrancy) {
            maxVibrancy = vibrancy;
            vibrantR = r;
            vibrantG = g;
            vibrantB = b;
          }

          rSum += r;
          gSum += g;
          bSum += b;
          validSamples++;
        }

        if (validSamples > 0) {
          // Calculate complementary or harmonic second color
          secondR = Math.min(255, Math.round(vibrantB * 0.8 + 20));
          secondG = Math.min(255, Math.round(vibrantR * 0.7 + 30));
          secondB = Math.min(255, Math.round(vibrantG * 0.9 + 40));
        }

        // Boost saturation if too muted
        const boostR = Math.min(255, Math.round(vibrantR * 1.15));
        const boostG = Math.min(255, Math.round(vibrantG * 1.15));
        const boostB = Math.min(255, Math.round(vibrantB * 1.15));

        const primaryHex = `#${((1 << 24) + (boostR << 16) + (boostG << 8) + boostB).toString(16).slice(1)}`;
        const accentHex = `#${((1 << 24) + (secondR << 16) + (secondG << 8) + secondB).toString(16).slice(1)}`;

        const palette: ThemePalette = {
          primary: primaryHex,
          accent: accentHex,
          backgroundGlow: `rgba(${boostR}, ${boostG}, ${boostB}, 0.28)`,
          surfaceColor: `rgba(${Math.round(boostR * 0.08 + 8)}, ${Math.round(boostG * 0.08 + 10)}, ${Math.round(boostB * 0.08 + 12)}, 0.95)`,
          lightGlow: `rgba(${secondR}, ${secondG}, ${secondB}, 0.18)`,
          isDynamic: true
        };

        paletteCache.set(imgUrl, palette);
        resolve(palette);
      } catch (err) {
        console.warn('Could not extract palette from album art', err);
        resolve(fallback);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(fallback);
    };

    img.src = imgUrl;
  });
}

// React Hook for dynamic Material You theming
export function useAlbumTheme(artworkUrl?: string, isDynamicEnabled: boolean = true): ThemePalette {
  const [palette, setPalette] = useState<ThemePalette>(DEFAULT_THEME);

  useEffect(() => {
    if (!isDynamicEnabled || !artworkUrl) {
      setPalette(DEFAULT_THEME);
      return;
    }

    let isMounted = true;
    extractPaletteFromImage(artworkUrl).then((p) => {
      if (isMounted) {
        setPalette(p);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [artworkUrl, isDynamicEnabled]);

  return isDynamicEnabled ? palette : DEFAULT_THEME;
}
