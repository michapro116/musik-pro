import { EqualizerSettings, EqualizerPreset, StandardEqualizerPreset, CustomPreset, ReverbMode, SpatialEnvironment } from '../types/music';

export const EQ_FREQUENCIES = [31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const PRESETS: Record<StandardEqualizerPreset, number[]> = {
  'Equilibrado': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Mega Graves': [9, 10, 7, 3, 0, 1, 2, 3, 4, 3],
  'Reggaetón': [7, 6, 4, 1, 0, 0, 2, 4, 5, 4],
  'Urbano': [6, 7, 5, 2, -1, 0, 2, 3, 5, 3],
  'Rock': [5, 4, 3, -1, -2, 1, 3, 4, 5, 5],
  'Voces': [-4, -3, -1, 2, 4, 5, 3, 1, 0, -1],
  'Personalizado': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};

const STORAGE_KEY_CUSTOM_PRESETS = 'mimusic_custom_presets_v1';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private bassBoostFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private loudnessNode: GainNode | null = null;
  private replayGainNode: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  // 3D Spatial Virtualizer Nodes (Stereo Haas cross-feed matrix)
  private spatialSplitter: ChannelSplitterNode | null = null;
  private spatialMerger: ChannelMergerNode | null = null;
  private spatialDelayL: DelayNode | null = null;
  private spatialDelayR: DelayNode | null = null;
  private spatialCrossGainL: GainNode | null = null;
  private spatialCrossGainR: GainNode | null = null;
  private spatialDirectGainL: GainNode | null = null;
  private spatialDirectGainR: GainNode | null = null;

  private isInitialized = false;

  private settings: EqualizerSettings = {
    enabled: true,
    replayGainEnabled: true,
    dynamicThemeEnabled: true,
    bassBoost: 40,
    bassCutoffFreq: 80,
    trebleBoost: 2,
    midBoost: 0,
    virtualizer: 45,
    spatialEnvironment: 'studio',
    loudnessGain: 15,
    reverbMode: 'off',
    bands: [...PRESETS['Reggaetón']],
    selectedPreset: 'Reggaetón',
    customPresets: []
  };

  constructor() {
    this.loadCustomPresetsFromStorage();
  }

  private loadCustomPresetsFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_PRESETS);
      if (stored) {
        this.settings.customPresets = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read custom presets from storage', e);
    }
  }

  private saveCustomPresetsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_PRESETS, JSON.stringify(this.settings.customPresets));
    } catch (e) {
      console.warn('Could not save custom presets to storage', e);
    }
  }

  public init(audioEl: HTMLAudioElement) {
    if (this.isInitialized && this.audioElement === audioEl) return;
    this.audioElement = audioEl;

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      this.sourceNode = this.ctx.createMediaElementSource(audioEl);
      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 128;
      this.analyserNode.smoothingTimeConstant = 0.82;

      // Dynamic Bass Boost filter (low shelf around selectable 60-120Hz)
      this.bassBoostFilter = this.ctx.createBiquadFilter();
      this.bassBoostFilter.type = 'lowshelf';
      this.bassBoostFilter.frequency.value = this.settings.bassCutoffFreq || 80;

      // Mid filter (peaking around 1000Hz)
      this.midFilter = this.ctx.createBiquadFilter();
      this.midFilter.type = 'peaking';
      this.midFilter.frequency.value = 1000;
      this.midFilter.Q.value = 1.0;

      // Treble filter (high shelf around 8000Hz)
      this.trebleFilter = this.ctx.createBiquadFilter();
      this.trebleFilter.type = 'highshelf';
      this.trebleFilter.frequency.value = 8000;

      // ReplayGain Normalizer node
      this.replayGainNode = this.ctx.createGain();
      this.replayGainNode.gain.value = 1.0;

      // Loudness gain node (clean amplifier)
      this.loudnessNode = this.ctx.createGain();
      this.loudnessNode.gain.value = 1.0;

      // 10-Band Equalizer Filters
      this.eqFilters = EQ_FREQUENCIES.map((freq) => {
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1.4;
        filter.gain.value = 0;
        return filter;
      });

      // 3D Spatial Virtualizer (Haas Cross-Feed Delay Matrix)
      this.spatialSplitter = this.ctx.createChannelSplitter(2);
      this.spatialMerger = this.ctx.createChannelMerger(2);

      this.spatialDirectGainL = this.ctx.createGain();
      this.spatialDirectGainR = this.ctx.createGain();
      this.spatialDelayL = this.ctx.createDelay(0.02);
      this.spatialDelayR = this.ctx.createDelay(0.02);
      this.spatialCrossGainL = this.ctx.createGain();
      this.spatialCrossGainR = this.ctx.createGain();

      // Configure initial delay for studio environment
      this.spatialDelayL.delayTime.value = 0.0012;
      this.spatialDelayR.delayTime.value = 0.0012;
      this.spatialCrossGainL.gain.value = -0.3; // Inverted phase cross-feed
      this.spatialCrossGainR.gain.value = -0.3;

      // Anti-clipping peak limiter (Dynamics Compressor)
      this.compressorNode = this.ctx.createDynamicsCompressor();
      this.compressorNode.threshold.value = -1.5;
      this.compressorNode.knee.value = 6;
      this.compressorNode.ratio.value = 8;
      this.compressorNode.attack.value = 0.003;
      this.compressorNode.release.value = 0.15;

      // Chain: Source -> ReplayGain -> BassBoost -> Mid -> Treble -> EQ1..EQ10 -> Loudness -> Spatializer -> Compressor -> Analyser -> Destination
      let currentNode: AudioNode = this.sourceNode;

      currentNode.connect(this.replayGainNode);
      currentNode = this.replayGainNode;

      currentNode.connect(this.bassBoostFilter);
      currentNode = this.bassBoostFilter;

      currentNode.connect(this.midFilter);
      currentNode = this.midFilter;

      currentNode.connect(this.trebleFilter);
      currentNode = this.trebleFilter;

      for (const filter of this.eqFilters) {
        currentNode.connect(filter);
        currentNode = filter;
      }

      currentNode.connect(this.loudnessNode);
      currentNode = this.loudnessNode;

      // Connect into 3D Spatial Virtualizer
      currentNode.connect(this.spatialSplitter);

      // Left Channel Routing
      this.spatialSplitter.connect(this.spatialDirectGainL, 0);
      this.spatialDirectGainL.connect(this.spatialMerger, 0, 0);

      this.spatialSplitter.connect(this.spatialDelayL, 0);
      this.spatialDelayL.connect(this.spatialCrossGainL);
      this.spatialCrossGainL.connect(this.spatialMerger, 0, 1); // Cross to right

      // Right Channel Routing
      this.spatialSplitter.connect(this.spatialDirectGainR, 1);
      this.spatialDirectGainR.connect(this.spatialMerger, 0, 1);

      this.spatialSplitter.connect(this.spatialDelayR, 1);
      this.spatialDelayR.connect(this.spatialCrossGainR);
      this.spatialCrossGainR.connect(this.spatialMerger, 0, 0); // Cross to left

      // Connect Merger to Compressor -> Analyser -> Destination
      this.spatialMerger.connect(this.compressorNode);
      this.compressorNode.connect(this.analyserNode);
      this.analyserNode.connect(this.ctx.destination);

      this.isInitialized = true;
      this.applySettings(this.settings);
    } catch (err) {
      console.warn('Web Audio API initialized with fallback', err);
    }
  }

  public resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public applySettings(newSettings: EqualizerSettings) {
    this.settings = { ...newSettings };
    if (!this.isInitialized || !this.ctx) return;

    const enabled = this.settings.enabled;

    if (this.bassBoostFilter) {
      if (this.settings.bassCutoffFreq) {
        this.bassBoostFilter.frequency.value = this.settings.bassCutoffFreq;
      }
      this.bassBoostFilter.gain.value = enabled ? (this.settings.bassBoost / 100) * 14 : 0;
    }

    // 3D Spatial Virtualizer parameters
    if (this.spatialCrossGainL && this.spatialCrossGainR && this.spatialDelayL && this.spatialDelayR) {
      const virt = enabled ? this.settings.virtualizer / 100 : 0;
      // Inverted phase cross-feed
      const crossGain = -0.42 * virt;
      this.spatialCrossGainL.gain.value = crossGain;
      this.spatialCrossGainR.gain.value = crossGain;

      // Direct gain adjustment for perception balance
      if (this.spatialDirectGainL && this.spatialDirectGainR) {
        this.spatialDirectGainL.gain.value = 1.0 + virt * 0.15;
        this.spatialDirectGainR.gain.value = 1.0 + virt * 0.15;
      }

      // Delay per spatial acoustic environment
      const env = this.settings.spatialEnvironment || 'studio';
      const delaySec = env === 'studio' ? 0.0012 : env === 'auditorium' ? 0.0024 : env === 'concert' ? 0.0032 : 0.0016;
      this.spatialDelayL.delayTime.value = delaySec;
      this.spatialDelayR.delayTime.value = delaySec;
    }

    if (this.midFilter) {
      this.midFilter.gain.value = enabled ? this.settings.midBoost : 0;
    }

    if (this.trebleFilter) {
      this.trebleFilter.gain.value = enabled ? this.settings.trebleBoost : 0;
    }

    if (this.loudnessNode) {
      const extraGain = enabled ? 1.0 + (this.settings.loudnessGain / 100) * 0.5 : 1.0;
      this.loudnessNode.gain.value = extraGain;
    }

    this.eqFilters.forEach((filter, idx) => {
      const gainVal = this.settings.bands[idx] ?? 0;
      filter.gain.value = enabled ? gainVal : 0;
    });
  }

  public getSettings(): EqualizerSettings {
    return { ...this.settings };
  }

  public setPreset(preset: EqualizerPreset) {
    // Check if it's a custom preset
    const custom = this.settings.customPresets.find((p) => p.name === preset);
    if (custom) {
      this.settings.selectedPreset = custom.name;
      this.settings.bands = [...custom.bands];
      this.settings.bassBoost = custom.bassBoost;
      this.settings.trebleBoost = custom.trebleBoost;
      this.settings.midBoost = custom.midBoost;
      this.settings.virtualizer = custom.virtualizer;
      this.applySettings(this.settings);
      return this.getSettings();
    }

    const presetBands = PRESETS[preset as StandardEqualizerPreset];
    if (presetBands) {
      this.settings.selectedPreset = preset;
      this.settings.bands = [...presetBands];
      if (preset === 'Mega Graves') {
        this.settings.bassBoost = 95;
        this.settings.bassCutoffFreq = 70;
        this.settings.trebleBoost = 3;
        this.settings.midBoost = 0;
        this.settings.virtualizer = 35;
        this.settings.loudnessGain = 18;
      } else if (preset === 'Reggaetón') {
        this.settings.bassBoost = 60;
        this.settings.trebleBoost = 3;
        this.settings.midBoost = 1;
        this.settings.virtualizer = 45;
        this.settings.loudnessGain = 20;
      } else if (preset === 'Urbano') {
        this.settings.bassBoost = 50;
        this.settings.trebleBoost = 2;
        this.settings.midBoost = 0;
        this.settings.virtualizer = 40;
        this.settings.loudnessGain = 15;
      } else if (preset === 'Rock') {
        this.settings.bassBoost = 35;
        this.settings.trebleBoost = 4;
        this.settings.midBoost = -1;
        this.settings.virtualizer = 30;
        this.settings.loudnessGain = 10;
      } else if (preset === 'Voces') {
        this.settings.bassBoost = 10;
        this.settings.trebleBoost = 2;
        this.settings.midBoost = 4;
        this.settings.virtualizer = 20;
        this.settings.loudnessGain = 5;
      } else if (preset === 'Equilibrado') {
        this.settings.bassBoost = 20;
        this.settings.trebleBoost = 0;
        this.settings.midBoost = 0;
        this.settings.virtualizer = 0;
        this.settings.loudnessGain = 0;
      }
      this.applySettings(this.settings);
    }
    return this.getSettings();
  }

  public saveCurrentAsCustomPreset(name: string): CustomPreset {
    const newPreset: CustomPreset = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      bands: [...this.settings.bands],
      bassBoost: this.settings.bassBoost,
      trebleBoost: this.settings.trebleBoost,
      midBoost: this.settings.midBoost,
      virtualizer: this.settings.virtualizer
    };

    // Filter out if duplicate name
    this.settings.customPresets = [
      ...this.settings.customPresets.filter((p) => p.name.toLowerCase() !== name.trim().toLowerCase()),
      newPreset
    ];
    this.settings.selectedPreset = newPreset.name;
    this.saveCustomPresetsToStorage();
    this.applySettings(this.settings);
    return newPreset;
  }

  public deleteCustomPreset(id: string) {
    this.settings.customPresets = this.settings.customPresets.filter((p) => p.id !== id);
    this.saveCustomPresetsToStorage();
    if (!this.settings.customPresets.some((p) => p.name === this.settings.selectedPreset)) {
      this.setPreset('Equilibrado');
    }
    return this.getSettings();
  }

  public setBandGain(index: number, gain: number) {
    if (index >= 0 && index < this.settings.bands.length) {
      this.settings.bands[index] = gain;
      this.settings.selectedPreset = 'Personalizado';
      this.applySettings(this.settings);
    }
    return this.getSettings();
  }

  public setBassBoost(value: number) {
    this.settings.bassBoost = Math.max(0, Math.min(100, value));
    this.settings.selectedPreset = 'Personalizado';
    this.applySettings(this.settings);
    return this.getSettings();
  }

  public setBassCutoffFreq(freq: number) {
    this.settings.bassCutoffFreq = Math.max(50, Math.min(150, freq));
    this.applySettings(this.settings);
    return this.getSettings();
  }

  public getBassBoostLevel(): 'normal' | 'boost' | 'extreme' {
    if (this.settings.bassBoost >= 80) return 'extreme';
    if (this.settings.bassBoost >= 45) return 'boost';
    return 'normal';
  }

  public cycleBassBoost(): { level: 'normal' | 'boost' | 'extreme'; settings: EqualizerSettings } {
    const current = this.getBassBoostLevel();
    let nextBoost = 25;
    let nextCutoff = 80;

    if (current === 'normal') {
      nextBoost = 70; // +10 dB Bass Boost
      nextCutoff = 80;
    } else if (current === 'boost') {
      nextBoost = 100; // +14 dB Mega Bass Extreme Subwoofer!
      nextCutoff = 65;
    } else {
      nextBoost = 25; // Normal
      nextCutoff = 80;
    }

    this.settings.bassBoost = nextBoost;
    this.settings.bassCutoffFreq = nextCutoff;
    this.settings.enabled = true; // Ensure effects are active
    this.applySettings(this.settings);
    return { level: this.getBassBoostLevel(), settings: this.getSettings() };
  }

  public setVirtualizer(value: number) {
    this.settings.virtualizer = Math.max(0, Math.min(100, value));
    this.applySettings(this.settings);
    return this.getSettings();
  }

  public setSpatialEnvironment(env: SpatialEnvironment) {
    this.settings.spatialEnvironment = env;
    this.applySettings(this.settings);
    return this.getSettings();
  }

  public setLoudness(value: number) {
    this.settings.loudnessGain = Math.max(0, Math.min(100, value));
    this.applySettings(this.settings);
    return this.getSettings();
  }

  public setReverbMode(mode: ReverbMode) {
    this.settings.reverbMode = mode;
    this.applySettings(this.settings);
    return this.getSettings();
  }

  public setTrebleBoost(value: number) {
    this.settings.trebleBoost = Math.max(-12, Math.min(12, value));
    this.settings.selectedPreset = 'Personalizado';
    this.applySettings(this.settings);
    return this.getSettings();
  }

  public setMidBoost(value: number) {
    this.settings.midBoost = Math.max(-12, Math.min(12, value));
    this.settings.selectedPreset = 'Personalizado';
    this.applySettings(this.settings);
    return this.getSettings();
  }

  private currentSongReplayGainDb = 0;

  public setSongReplayGain(gainDb?: number) {
    this.currentSongReplayGainDb = gainDb ?? 0;
    if (this.replayGainNode && this.ctx) {
      const enabled = this.settings.replayGainEnabled ?? true;
      const targetGain = (enabled && gainDb !== undefined) ? Math.pow(10, gainDb / 20) : 1.0;
      this.replayGainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.04);
    }
  }

  public toggleReplayGain() {
    this.settings.replayGainEnabled = !this.settings.replayGainEnabled;
    this.setSongReplayGain(this.currentSongReplayGainDb);
    return this.getSettings();
  }

  public toggleEnabled() {
    this.settings.enabled = !this.settings.enabled;
    this.applySettings(this.settings);
    return this.getSettings();
  }

  public getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }

  public isAudioContextRunning(): boolean {
    return this.ctx?.state === 'running';
  }

  public getVisualizerData(dataArray: Uint8Array): void {
    if (this.analyserNode) {
      this.analyserNode.getByteFrequencyData(dataArray as unknown as Uint8Array<ArrayBuffer>);
    }
  }

  public getTimeDomainData(dataArray: Uint8Array): void {
    if (this.analyserNode) {
      this.analyserNode.getByteTimeDomainData(dataArray as unknown as Uint8Array<ArrayBuffer>);
    }
  }
}

export const audioEngine = new AudioEngine();
