import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SignaturePad } from '../src/presentation/components/SignaturePad';

describe('SignaturePad component', () => {
  it('creates signature pad element with default props', () => {
    const el = createElement(SignaturePad);
    expect(el.props.label).toBeUndefined();
    expect(el.props.height).toBeUndefined();
  });

  it('accepts custom label, clear text, and height', () => {
    const el = createElement(SignaturePad, {
      label: 'Client Approval',
      clearText: 'Reset',
      height: 220,
      width: '80%',
      strokeColor: '#000000',
      strokeWidth: 3,
    });
    expect(el.props.label).toBe('Client Approval');
    expect(el.props.clearText).toBe('Reset');
    expect(el.props.height).toBe(220);
    expect(el.props.width).toBe('80%');
    expect(el.props.strokeColor).toBe('#000000');
    expect(el.props.strokeWidth).toBe(3);
  });

  it('handles value and onChange callback', () => {
    const handleChange = vi.fn();
    const handleClear = vi.fn();
    const el = createElement(SignaturePad, {
      value: 'data:image/png;base64,sample',
      onChange: handleChange,
      onClear: handleClear,
      disabled: true,
    });
    expect(el.props.value).toBe('data:image/png;base64,sample');
    expect(el.props.onChange).toBe(handleChange);
    expect(el.props.onClear).toBe(handleClear);
    expect(el.props.disabled).toBe(true);
  });
});
