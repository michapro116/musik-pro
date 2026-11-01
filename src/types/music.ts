export interface SyncedLyricLine {
  time: number; // in seconds
  text: string;
}

export type AudioFormat = 'FLAC' | 'WAV' | 'MP3' | 'AAC' | 'ALAC' | 'OGG';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  url?: string;
  artwork?: string;
  isFavorite?: boolean;
  isDownloaded?: boolean;
  isLocal?: boolean;
  fileSize?: string;
  dateAdded?: number;
  genre?: string;
  year?: string;
  trackNumber?: string;
  composer?: string;
  folderPath?: string;
  lyrics?: string[];
  syncedLyrics?: SyncedLyricLine[];
  audioFormat?: AudioFormat;
  bitrate?: string;
  isHiRes?: boolean;
  replayGainDb?: number;
  playCount?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  songIds: string[];
  createdAt: number;
}

export type StandardEqualizerPreset = 
  | 'Equilibrado'
  | 'Mega Graves'
  | 'Reggaetón'
  | 'Urbano'
  | 'Rock'
  | 'Voces'
  | 'Personalizado';

export type EqualizerPreset = StandardEqualizerPreset | string;

export type BassBoostLevel = 'normal' | 'boost' | 'extreme';

export type ReverbMode = 'off' | 'studio' | 'room' | 'concert' | 'club';
export type SpatialEnvironment = 'studio' | 'auditorium' | 'concert' | 'club';

export interface ThemePalette {
  primary: string;
  accent: string;
  backgroundGlow: string;
  surfaceColor: string;
  lightGlow: string;
  isDynamic: boolean;
}

export interface CustomPreset {
  id: string;
  name: string;
  bands: number[];
  bassBoost: number;
  trebleBoost: number;
  midBoost: number;
  virtualizer: number;
  bassCutoffFreq?: number;
  spatialEnvironment?: SpatialEnvironment;
}

export interface EqualizerSettings {
  enabled: boolean;
  bassBoost: number; // 0 to 100
  bassCutoffFreq?: number; // 60, 80, 100, 120 Hz
  trebleBoost: number; // -12 to +12 dB
  midBoost: number; // -12 to +12 dB
  virtualizer: number; // 0 to 100 (Spatial 3D audio)
  spatialEnvironment?: SpatialEnvironment; // studio, auditorium, concert, club
  loudnessGain: number; // 0 to 100% boost
  reverbMode: ReverbMode;
  replayGainEnabled?: boolean;
  dynamicThemeEnabled?: boolean;
  bands: number[]; // 10 bands in dB (-12 to +12)
  selectedPreset: EqualizerPreset;
  customPresets: CustomPreset[];
}

export type PlayMode = 'normal' | 'repeat-all' | 'repeat-one' | 'shuffle';

export interface AndroidProjectFile {
  path: string;
  language: string;
  description: string;
  content: string;
}

export interface DriveItem {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  size: string;
  mimeType: string;
  isFolder?: boolean;
  downloadProgress?: number;
  isDownloaded?: boolean;
}

export type DeviceType = 'local' | 'bluetooth' | 'cast';

export interface AudioOutputDevice {
  id: string;
  name: string;
  type: DeviceType;
  isConnected: boolean;
  volume: number; // 0 to 100
  batteryLevel?: number; // 0 to 100
  description: string;
}

export interface FolderNode {
  id: string;
  name: string;
  path: string;
  isFolder: boolean;
  subFolders?: FolderNode[];
  songs?: Song[];
  songCount?: number;
  totalSize?: string;
}

export type PlaybackSpeed = 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0;

export interface LibraryBackup {
  version: string;
  timestamp: number;
  appName: string;
  songs: Song[];
  playlists: Playlist[];
  equalizerSettings: EqualizerSettings;
}

export interface CarModeState {
  isActive: boolean;
  highContrast: boolean;
  simulatedSpeedKmh: number;
}

