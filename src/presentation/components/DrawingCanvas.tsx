import type { CSSProperties, ChangeEvent } from 'react';
import { useCallback, useState } from 'react';
import { useFreehandCanvas } from '../hooks/useFreehandCanvas';

export interface DrawingCanvasProps {
  width?: number | string;
  height?: number | string;
  initialBrushSize?: number;
  initialColor?: string;
  presetColors?: readonly string[];
  brushSizes?: readonly number[];
  showToolbar?: boolean;
  showColorPicker?: boolean;
  showSizePicker?: boolean;
  showUndo?: boolean;
  showClear?: boolean;
  showDownload?: boolean;
  onSave?: (dataUrl: string) => void;
  className?: string;
  canvasClassName?: string;
  toolbarClassName?: string;
  style?: CSSProperties;
}

const DEFAULT_PRESET_COLORS: readonly string[] = [
  '#1a1a1a',
  '#e11d48',
  '#2563eb',
  '#16a34a',
  '#d97706',
  '#9333ea',
  '#64748b',
];

const DEFAULT_BRUSH_SIZES: readonly number[] = [2, 4, 8, 14];

export function DrawingCanvas({
  width = '100%',
  height = 360,
  initialBrushSize = 3,
  initialColor = '#1a1a1a',
  presetColors = DEFAULT_PRESET_COLORS,
  brushSizes = DEFAULT_BRUSH_SIZES,
  showToolbar = true,
  showColorPicker = true,
  showSizePicker = true,
  showUndo = true,
  showClear = true,
  showDownload = true,
  onSave,
  className,
  canvasClassName,
  toolbarClassName,
  style,
}: DrawingCanvasProps) {
  const [brushSize, setBrushSize] = useState(initialBrushSize);
  const [color, setColor] = useState(initialColor);

  const { canvasRef, undo, clear, strokeCount } = useFreehandCanvas({
    brushSize,
    color,
    pressureEnabled: true,
  });

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `sketch-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }, [canvasRef]);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onSave) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  }, [canvasRef, onSave]);

  return (
    <div
      className={className ?? 'ucanvas-drawing-board'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '10px',
        border: '1px solid rgba(128, 128, 128, 0.2)',
        overflow: 'hidden',
        background: '#ffffff',
        fontFamily: 'inherit',
        ...style,
      }}
    >
      {showToolbar && (
        <div
          className={toolbarClassName ?? 'ucanvas-toolbar'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '8px 12px',
            borderBottom: '1px solid rgba(128, 128, 128, 0.15)',
            background: 'rgba(128, 128, 128, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {showColorPicker && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {presetColors.map((preset) => {
                  const isActive = preset.toLowerCase() === color.toLowerCase();
                  return (
                    <button
                      key={preset}
                      type="button"
                      aria-label={`Select color ${preset}`}
                      onClick={() => setColor(preset)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: preset,
                        border: isActive ? '2px solid #2563eb' : '1px solid rgba(0, 0, 0, 0.15)',
                        transform: isActive ? 'scale(1.15)' : 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    />
                  );
                })}
                <input
                  type="color"
                  value={color}
                  aria-label="Custom color picker"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setColor(e.target.value)}
                  style={{
                    width: '24px',
                    height: '24px',
                    padding: 0,
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: 'transparent',
                  }}
                />
              </div>
            )}

            {showSizePicker && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
                {brushSizes.map((size) => {
                  const isActive = size === brushSize;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setBrushSize(size)}
                      style={{
                        padding: '3px 7px',
                        fontSize: '11px',
                        fontWeight: isActive ? 600 : 400,
                        borderRadius: '4px',
                        border: '1px solid rgba(128, 128, 128, 0.25)',
                        background: isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                        color: isActive ? '#2563eb' : 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      {size}px
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {showUndo && (
              <button
                type="button"
                onClick={undo}
                disabled={strokeCount === 0}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  borderRadius: '5px',
                  border: '1px solid rgba(128, 128, 128, 0.25)',
                  background: 'transparent',
                  cursor: strokeCount === 0 ? 'not-allowed' : 'pointer',
                  opacity: strokeCount === 0 ? 0.4 : 1,
                  color: 'inherit',
                }}
              >
                Undo
              </button>
            )}

            {showClear && (
              <button
                type="button"
                onClick={clear}
                disabled={strokeCount === 0}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  borderRadius: '5px',
                  border: '1px solid rgba(128, 128, 128, 0.25)',
                  background: 'transparent',
                  cursor: strokeCount === 0 ? 'not-allowed' : 'pointer',
                  opacity: strokeCount === 0 ? 0.4 : 1,
                  color: '#e11d48',
                }}
              >
                Clear
              </button>
            )}

            {showDownload && (
              <button
                type="button"
                onClick={handleDownload}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 500,
                  borderRadius: '5px',
                  border: '1px solid rgba(128, 128, 128, 0.25)',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'inherit',
                }}
              >
                Download
              </button>
            )}

            {onSave && (
              <button
                type="button"
                onClick={handleSave}
                style={{
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '5px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: height }}>
        <canvas
          ref={canvasRef as unknown as React.Ref<HTMLCanvasElement>}
          className={canvasClassName ?? 'ucanvas-surface'}
          style={{
            display: 'block',
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            touchAction: 'none',
            cursor: 'crosshair',
          }}
        />
      </div>
    </div>
  );
}
