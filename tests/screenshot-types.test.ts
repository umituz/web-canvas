import { describe, expect, it } from 'vitest';
import {
  BackgroundPatternEnum,
  DeviceTypeEnum,
  FrameStyleEnum,
  LayoutStyleEnum,
  ScreenshotFormatEnum,
} from '../src/domain/types/screenshot.types';

describe('Screenshot Enums', () => {
  it('defines valid device types', () => {
    expect(DeviceTypeEnum.IPHONE_15_PRO).toBe('iphone-15-pro');
    expect(DeviceTypeEnum.IPAD_PRO).toBe('ipad-pro');
    expect(DeviceTypeEnum.DESKTOP).toBe('desktop');
  });

  it('defines frame styles', () => {
    expect(FrameStyleEnum.REALISTIC).toBe('realistic');
    expect(FrameStyleEnum.MINIMAL).toBe('minimal');
    expect(FrameStyleEnum.NONE).toBe('none');
  });

  it('defines layout styles', () => {
    expect(LayoutStyleEnum.TEXT_TOP).toBe('text-top');
    expect(LayoutStyleEnum.TEXT_BOTTOM).toBe('text-bottom');
    expect(LayoutStyleEnum.TEXT_OVERLAY).toBe('text-overlay');
  });

  it('defines background patterns', () => {
    expect(BackgroundPatternEnum.DOTS).toBe('dots');
    expect(BackgroundPatternEnum.GRID).toBe('grid');
    expect(BackgroundPatternEnum.WAVES).toBe('waves');
  });

  it('defines export formats', () => {
    expect(ScreenshotFormatEnum.PNG).toBe('png');
    expect(ScreenshotFormatEnum.JPEG).toBe('jpeg');
    expect(ScreenshotFormatEnum.WEBP).toBe('webp');
  });
});
