import type { CSSProperties, PointerEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface SignaturePadProps {
  value?: string | null;
  onChange?: (dataUrl: string | null) => void;
  onClear?: () => void;
  label?: string;
  hint?: string;
  clearText?: string;
  width?: number | string;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  disabled?: boolean;
  className?: string;
  canvasClassName?: string;
  style?: CSSProperties;
}

export function SignaturePad({
  value,
  onChange,
  onClear,
  label = 'Signature',
  hint = 'Draw above with mouse, pen, or finger',
  clearText = 'Clear',
  width = '100%',
  height = 160,
  strokeColor = '#111827',
  strokeWidth = 2,
  disabled = false,
  className,
  canvasClassName,
  style,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(Boolean(value));

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = strokeColor;
  }, [strokeColor, strokeWidth]);

  useEffect(() => {
    setupCanvas();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = value;
    }
  }, [setupCanvas, value]);

  useEffect(() => {
    const handleResize = () => {
      const committed = hasInk && canvasRef.current ? canvasRef.current.toDataURL('image/png') : null;
      setupCanvas();
      if (committed && canvasRef.current) {
        const img = new Image();
        img.onload = () => {
          const ctx = canvasRef.current?.getContext('2d');
          if (ctx) ctx.drawImage(img, 0, 0);
        };
        img.src = committed;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hasInk, setupCanvas]);

  const getCanvasPoint = (e: PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    lastPoint.current = getCanvasPoint(e);
  };

  const handlePointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || disabled) return;
    const ctx = canvasRef.current?.getContext('2d');
    const from = lastPoint.current;
    const to = getCanvasPoint(e);
    lastPoint.current = to;
    if (!ctx || !from) return;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    if (!hasInk) {
      setHasInk(true);
    }
  };

  const handlePointerUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    lastPoint.current = null;
    const canvas = canvasRef.current;
    if (canvas && onChange) {
      const dataUrl = canvas.toDataURL('image/png');
      onChange(dataUrl);
    }
  };

  const handleClear = () => {
    if (disabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasInk(false);
    onChange?.(null);
    onClear?.();
  };

  return (
    <div
      className={className ?? 'ucanvas-sigpad'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: typeof width === 'number' ? `${width}px` : width,
        fontFamily: 'inherit',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {label ? (
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#4b5563',
              letterSpacing: '0.025em',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </span>
        ) : null}

        {hasInk && !disabled ? (
          <button
            type="button"
            onClick={handleClear}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'transparent',
              border: 'none',
              color: '#dc2626',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '2px 6px',
            }}
          >
            {clearText}
          </button>
        ) : null}
      </div>

      <div
        style={{
          position: 'relative',
          borderRadius: '8px',
          border: '1px solid rgba(128, 128, 128, 0.25)',
          background: '#ffffff',
          overflow: 'hidden',
          minHeight: `${height}px`,
        }}
      >
        <canvas
          ref={canvasRef as unknown as React.Ref<HTMLCanvasElement>}
          className={canvasClassName ?? 'ucanvas-sigpad-surface'}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          role="img"
          aria-label={`Draw ${label.toLowerCase()} here`}
          style={{
            display: 'block',
            width: '100%',
            height: `${height}px`,
            touchAction: 'none',
            cursor: disabled ? 'not-allowed' : 'crosshair',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: '16px',
            right: '16px',
            bottom: '28px',
            borderBottom: '1px dashed rgba(128, 128, 128, 0.3)',
            pointerEvents: 'none',
          }}
        />

        {!hasInk && hint ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              fontSize: '12px',
              color: '#9ca3af',
              userSelect: 'none',
            }}
          >
            {hint}
          </div>
        ) : null}
      </div>
    </div>
  );
}
