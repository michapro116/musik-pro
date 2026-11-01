import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';

interface WaveformVisualizerProps {
  isPlaying: boolean;
  height?: number;
  className?: string;
  theme?: 'emerald' | 'cyan' | 'audiophile';
  showPeaks?: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isPlaying,
  height = 56,
  className = '',
  theme = 'emerald',
  showPeaks = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const sampleSize = 64;
    const timeData = new Uint8Array(sampleSize);
    const freqData = new Uint8Array(sampleSize);

    // Continuous smoothed vertex points to prevent any jarring transition or flicker
    const smoothedPoints = new Float32Array(sampleSize);
    for (let i = 0; i < sampleSize; i++) {
      smoothedPoints[i] = 0;
    }

    let phase = 0;
    let targetEnergy = 0;
    let currentEnergy = 0;

    const render = () => {
      animationId = requestAnimationFrame(render);

      const width = canvas.width;
      const h = canvas.height;
      const centerY = h / 2;

      // Extract raw audio data
      if (isPlaying) {
        audioEngine.getTimeDomainData(timeData);
        audioEngine.getVisualizerData(freqData);

        // Calculate RMS audio energy
        let sum = 0;
        for (let i = 0; i < 16; i++) {
          sum += freqData[i];
        }
        targetEnergy = Math.min(1.0, (sum / (16 * 255)) * 1.6);
      } else {
        targetEnergy = 0;
      }

      // Smooth energy transition (prevents flicker on gapless track switch)
      currentEnergy += (targetEnergy - currentEnergy) * 0.12;

      // Advance wave phase smoothly
      phase += 0.045 + currentEnergy * 0.035;

      // Clear with slight motion blur / persistence
      ctx.clearRect(0, 0, width, h);

      // Update smoothed points with temporal damping
      for (let i = 0; i < sampleSize; i++) {
        let rawVal = 0;
        if (isPlaying && currentEnergy > 0.01) {
          // Time domain center normalized (-1 to +1)
          const byteNorm = (timeData[i] - 128) / 128.0;
          // Frequency component contribution
          const freqNorm = freqData[i % 32] / 255.0;
          rawVal = byteNorm * 0.7 + freqNorm * 0.5;
        }

        // Add subtle continuous organic breathing wave even in low amplitudes so it never snaps to flat line
        const harmonic = Math.sin(phase + (i / sampleSize) * Math.PI * 4) * (0.08 + currentEnergy * 0.35);
        const targetVal = rawVal * currentEnergy + harmonic;

        // Exponential smoothing (Lerp) - zero flicker guaranteed
        smoothedPoints[i] += (targetVal - smoothedPoints[i]) * 0.18;
      }

      // Draw Multi-layer glowing fluid waveform
      const step = width / (sampleSize - 1);

      // --- LAYER 1: Deep Ambient Glow Fill ---
      ctx.beginPath();
      ctx.moveTo(0, centerY);

      for (let i = 0; i < sampleSize; i++) {
        const x = i * step;
        const amp = smoothedPoints[i] * (h * 0.42);
        const y = centerY + amp;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevX = (i - 1) * step;
          const prevAmp = smoothedPoints[i - 1] * (h * 0.42);
          const prevY = centerY + prevAmp;
          const cpX = (prevX + x) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
        }
      }

      ctx.lineTo(width, centerY);
      ctx.closePath();

      const bgGradient = ctx.createLinearGradient(0, 0, width, h);
      if (theme === 'cyan') {
        bgGradient.addColorStop(0, 'rgba(6, 182, 212, 0.18)');
        bgGradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.22)');
        bgGradient.addColorStop(1, 'rgba(99, 102, 241, 0.12)');
      } else {
        bgGradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
        bgGradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.20)');
        bgGradient.addColorStop(1, 'rgba(16, 185, 129, 0.08)');
      }

      ctx.fillStyle = bgGradient;
      ctx.fill();

      // --- LAYER 2: Inverted Mirror Shimmer Wave ---
      ctx.beginPath();
      ctx.moveTo(0, centerY);

      for (let i = 0; i < sampleSize; i++) {
        const x = i * step;
        // Mirror with 70% damping and harmonic offset
        const mirrorAmp = -smoothedPoints[i] * (h * 0.32);
        const y = centerY + mirrorAmp;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevX = (i - 1) * step;
          const prevY = centerY - smoothedPoints[i - 1] * (h * 0.32);
          const cpX = (prevX + x) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
        }
      }

      ctx.strokeStyle = theme === 'cyan' ? 'rgba(6, 182, 212, 0.45)' : 'rgba(16, 185, 129, 0.40)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // --- LAYER 3: Main High-Definition Glowing Crest Line ---
      ctx.beginPath();
      for (let i = 0; i < sampleSize; i++) {
        const x = i * step;
        const amp = smoothedPoints[i] * (h * 0.44);
        const y = centerY + amp;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevX = (i - 1) * step;
          const prevAmp = smoothedPoints[i - 1] * (h * 0.44);
          const prevY = centerY + prevAmp;
          const cpX = (prevX + x) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
        }
      }

      const strokeGradient = ctx.createLinearGradient(0, 0, width, 0);
      strokeGradient.addColorStop(0, '#10b981');
      strokeGradient.addColorStop(0.5, '#06b6d4');
      strokeGradient.addColorStop(1, '#10b981');

      ctx.strokeStyle = strokeGradient;
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

      // Center baseline subtle guide line
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, theme]);

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl select-none ${className}`}>
      <canvas
        ref={canvasRef}
        width={600}
        height={height}
        className="w-full block bg-transparent"
      />
    </div>
  );
};
