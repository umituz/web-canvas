/**
 * Device Configuration Service
 * Manages device configurations and dimensions
 */

import { DeviceType, DeviceConfig } from '../../domain/types/screenshot.types';
import { DEVICE_DIMENSIONS } from '../../domain/config/DeviceConfig';

/**
 * Device configuration service
 */
export class DeviceConfigService {
  private static instance: DeviceConfigService;
  private devices: Map<DeviceType, DeviceConfig>;
  private phonesCache: DeviceConfig[] | null = null;
  private tabletsCache: DeviceConfig[] | null = null;
  private allDevicesCache: DeviceConfig[] | null = null;

  private constructor() {
    this.devices = new Map();
    this.initializeDevices();
  }

  public static getInstance(): DeviceConfigService {
    if (!DeviceConfigService.instance) {
      DeviceConfigService.instance = new DeviceConfigService();
    }
    return DeviceConfigService.instance;
  }

  private initializeDevices(): void {
    const deviceConfigs: Omit<DeviceConfig, 'type'>[] = [
      {
        name: 'iPhone 15 Pro',
        dimensions: { width: 1290, height: 2796, scale: 3 },
        isPhone: true,
        hasNotch: true,
        cornerRadius: 20,
        frameThickness: 8,
      },
      {
        name: 'iPhone 15',
        dimensions: { width: 1179, height: 2556, scale: 3 },
        isPhone: true,
        hasNotch: true,
        cornerRadius: 20,
        frameThickness: 8,
      },
      {
        name: 'iPhone SE',
        dimensions: { width: 1080, height: 2340, scale: 3 },
        isPhone: true,
        hasNotch: false,
        cornerRadius: 16,
        frameThickness: 6,
      },
      {
        name: 'iPad Pro',
        dimensions: { width: 2048, height: 2732, scale: 2 },
        isTablet: true,
        hasNotch: false,
        cornerRadius: 24,
        frameThickness: 10,
      },
      {
        name: 'iPad',
        dimensions: { width: 1620, height: 2160, scale: 2 },
        isTablet: true,
        hasNotch: false,
        cornerRadius: 20,
        frameThickness: 10,
      },
      {
        name: 'Android Phone',
        dimensions: { width: 1440, height: 3120, scale: 3 },
        isPhone: true,
        hasNotch: false,
        cornerRadius: 24,
        frameThickness: 8,
      },
      {
        name: 'Android Tablet',
        dimensions: { width: 2000, height: 2200, scale: 2 },
        isTablet: true,
        hasNotch: false,
        cornerRadius: 24,
        frameThickness: 10,
      },
      {
        name: 'Desktop',
        dimensions: { width: 1920, height: 1080, scale: 1 },
        isPhone: false,
        isTablet: false,
        hasNotch: false,
        cornerRadius: 0,
        frameThickness: 0,
      },
    ];

    Object.entries(DEVICE_DIMENSIONS).forEach(([type, dimensions]) => {
      const deviceType = type as DeviceType;
      const config = deviceConfigs.find((_, index) => {
        const types = Object.keys(DEVICE_DIMENSIONS);
        return types[index] === type;
      });

      if (config) {
        this.devices.set(deviceType, {
          type: deviceType,
          ...config,
          dimensions,
        });
      }
    });
  }

  public getDeviceConfig(deviceType: DeviceType): DeviceConfig | undefined {
    return this.devices.get(deviceType);
  }

  public getAllDevices(): DeviceConfig[] {
    // Use cached value if available
    if (!this.allDevicesCache) {
      this.allDevicesCache = Array.from(this.devices.values());
    }
    return this.allDevicesCache;
  }

  public getPhones(): DeviceConfig[] {
    // Use cached value if available
    if (!this.phonesCache) {
      this.phonesCache = this.getAllDevices().filter((d) => d.isPhone);
    }
    return this.phonesCache;
  }

  public getTablets(): DeviceConfig[] {
    // Use cached value if available
    if (!this.tabletsCache) {
      this.tabletsCache = this.getAllDevices().filter((d) => d.isTablet);
    }
    return this.tabletsCache;
  }

  public isPhone(deviceType: DeviceType): boolean {
    const config = this.getDeviceConfig(deviceType);
    return config?.isPhone || false;
  }

  public isTablet(deviceType: DeviceType): boolean {
    const config = this.getDeviceConfig(deviceType);
    return config?.isTablet || false;
  }

  public hasNotch(deviceType: DeviceType): boolean {
    const config = this.getDeviceConfig(deviceType);
    return config?.hasNotch || false;
  }
}
