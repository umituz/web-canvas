
import type { DeviceType } from '../types/screenshot.types';

export interface DeviceConfigOption {
  devices: DeviceType[];
  defaultDevice?: DeviceType;
  showFrame?: boolean;
  frameColor?: string;
  frameThickness?: number;
}

export const DEVICE_DIMENSIONS: Record<DeviceType, { width: number; height: number }> = {
  'iphone-15-pro': { width: 1290, height: 2796 },
  'iphone-15': { width: 1179, height: 2556 },
  'iphone-se': { width: 1080, height: 2340 },
  'ipad-pro': { width: 2048, height: 2732 },
  'ipad': { width: 1620, height: 2160 },
  'android-phone': { width: 1440, height: 3120 },
  'android-tablet': { width: 2000, height: 2200 },
  'desktop': { width: 1920, height: 1080 },
};

export const DEFAULT_DEVICE_CONFIG: DeviceConfigOption = {
  devices: Object.keys(DEVICE_DIMENSIONS) as DeviceType[],
  defaultDevice: 'iphone-15-pro',
  showFrame: true,
  frameColor: '#1f2937',
  frameThickness: 8,
};
