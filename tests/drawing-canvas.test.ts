import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DrawingCanvas } from '../src/presentation/components/DrawingCanvas';

describe('DrawingCanvas component', () => {
  it('creates drawing canvas element with default props', () => {
    const el = createElement(DrawingCanvas);
    expect(el.props.width).toBeUndefined();
    expect(el.props.height).toBeUndefined();
  });

  it('accepts custom sizing and colors', () => {
    const el = createElement(DrawingCanvas, {
      width: 500,
      height: 300,
      initialColor: '#2563eb',
      initialBrushSize: 8,
      presetColors: ['#2563eb', '#e11d48'],
    });
    expect(el.props.width).toBe(500);
    expect(el.props.height).toBe(300);
    expect(el.props.initialColor).toBe('#2563eb');
    expect(el.props.initialBrushSize).toBe(8);
  });

  it('accepts save callback and toolbar visibility toggles', () => {
    const handleSave = vi.fn();
    const el = createElement(DrawingCanvas, {
      showToolbar: false,
      onSave: handleSave,
    });
    expect(el.props.showToolbar).toBe(false);
    expect(el.props.onSave).toBe(handleSave);
  });
});
