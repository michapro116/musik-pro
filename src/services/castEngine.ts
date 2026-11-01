import { AudioOutputDevice } from '../types/music';

const INITIAL_DEVICES: AudioOutputDevice[] = [
  {
    id: 'dev-local',
    name: 'Altavoz del Dispositivo',
    type: 'local',
    isConnected: true,
    volume: 85,
    description: 'Salida de audio predeterminada interna'
  },
  {
    id: 'dev-bt-sony',
    name: 'Sony WH-1000XM5 (LDAC/A2DP)',
    type: 'bluetooth',
    isConnected: false,
    volume: 75,
    batteryLevel: 92,
    description: 'Auriculares Hi-Res con cancelación de ruido'
  },
  {
    id: 'dev-cast-nest',
    name: 'Google Nest Audio — Sala',
    type: 'cast',
    isConnected: false,
    volume: 60,
    description: 'Altavoz inteligente Google Cast en red WiFi'
  },
  {
    id: 'dev-cast-tv',
    name: 'Smart TV LG OLED 65" — Salón',
    type: 'cast',
    isConnected: false,
    volume: 50,
    description: 'Pantalla Chromecast / Android TV'
  },
  {
    id: 'dev-bt-jbl',
    name: 'JBL Charge 5 (Bluetooth)',
    type: 'bluetooth',
    isConnected: false,
    volume: 80,
    batteryLevel: 68,
    description: 'Altavoz portátil inalámbrico'
  }
];

class CastEngine {
  private devices: AudioOutputDevice[] = [...INITIAL_DEVICES];
  private activeDeviceId: string = 'dev-local';
  private isScanning: boolean = false;
  private listeners: Array<() => void> = [];

  public getDevices(): AudioOutputDevice[] {
    return this.devices.map((d) => ({
      ...d,
      isConnected: d.id === this.activeDeviceId
    }));
  }

  public getActiveDevice(): AudioOutputDevice {
    const dev = this.devices.find((d) => d.id === this.activeDeviceId);
    return dev || this.devices[0];
  }

  public async connectDevice(deviceId: string): Promise<AudioOutputDevice> {
    const target = this.devices.find((d) => d.id === deviceId);
    if (!target) throw new Error('Dispositivo no encontrado');

    this.activeDeviceId = deviceId;
    this.notify();
    return this.getActiveDevice();
  }

  public setDeviceVolume(deviceId: string, volume: number) {
    this.devices = this.devices.map((d) =>
      d.id === deviceId ? { ...d, volume: Math.max(0, Math.min(100, volume)) } : d
    );
    this.notify();
  }

  public async scanForDevices(): Promise<void> {
    this.isScanning = true;
    this.notify();

    return new Promise((resolve) => {
      setTimeout(() => {
        this.isScanning = false;
        this.notify();
        resolve();
      }, 1500);
    });
  }

  public getIsScanning(): boolean {
    return this.isScanning;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const castEngine = new CastEngine();
