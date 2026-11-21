import { describe, expect, it } from 'vitest';
import { DeviceConfigService } from '../src/infrastructure/services/DeviceConfigService';

describe('DeviceConfigService', () => {
  it('returns singleton instance', () => {
    const service1 = DeviceConfigService.getInstance();
    const service2 = DeviceConfigService.getInstance();
    expect(service1).toBe(service2);
  });

  it('retrieves device by type', () => {
    const service = DeviceConfigService.getInstance();
    const iphone15Pro = service.getDeviceConfig('iphone-15-pro');
    expect(iphone15Pro).toBeDefined();
    expect(iphone15Pro?.name).toBe('iPhone 15 Pro');
    expect(iphone15Pro?.dimensions.width).toBe(1290);
    expect(iphone15Pro?.dimensions.height).toBe(2796);
    expect(iphone15Pro?.isPhone).toBe(true);
  });

  it('filters phones and tablets correctly', () => {
    const service = DeviceConfigService.getInstance();
    const phones = service.getPhones();
    const tablets = service.getTablets();

    expect(phones.length).toBeGreaterThan(0);
    expect(tablets.length).toBeGreaterThan(0);
    expect(phones.every((d) => d.isPhone)).toBe(true);
    expect(tablets.every((d) => d.isTablet)).toBe(true);
  });

  it('returns all registered devices', () => {
    const service = DeviceConfigService.getInstance();
    const all = service.getAllDevices();
    expect(all.length).toBeGreaterThanOrEqual(5);
  });
});
