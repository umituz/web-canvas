/**
 * useFreehandCanvas Hook
 * React hook for pointer-based freehand drawing on a canvas
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  FreehandPoint,
  FreehandStroke,
  UseFreehandCanvasOptions,
} from '../../domain/types/freehand.types';

const DEFAULT_BRUSH_SIZE = 3;
const DEFAULT_COLOR = '#1a1a1a';

/**
 * Width for a point: constant for mouse/touch, pressure-scaled for pens
 */
function widthFor(stroke: FreehandStroke, point: FreehandPoint): number {
  if (!stroke.dynamic) return stroke.size;
  // pressure is 0 (some mice) – 1 (hard press); clamp the visual range
  return stroke.size * (0.5 + Math.min(1, Math.max(0, point.pressure)));
}

/**
 * Return value of the useFreehandCanvas hook
 */
export interface UseFreehandCanvasReturn {
  /** Ref to attach to the <canvas> element that captures drawing. */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Remove the most recent stroke. */
  undo: () => void;
  /** Remove all strokes. */
  clear: () => void;
  /** Number of committed strokes. */
  strokeCount: number;
  /** True when no strokes are committed. */
  isEmpty: boolean;
  /** Snapshot of committed strokes (safe to serialize). */
  getStrokes: () => FreehandStroke[];
}

/**
 * useFreehandCanvas hook
 *
 * Attaches pointer-event drawing to a canvas element. The canvas is sized to
 * its CSS box at device-pixel resolution (and re-rendered on resize), strokes
 * are replayed from captured points so undo/clear are lossless, and stylus
 * pressure modulates line width when the pointer reports it.
 *
 * The canvas gets `touch-action: none` applied so drawing works on touch
 * screens without scrolling the page. Consumers typically layer the canvas
 * over their own guide content (e.g. a faint glyph to trace).
 */
export function useFreehandCanvas(
  options: UseFreehandCanvasOptions = {}
): UseFreehandCanvasReturn {
  const { brushSize = DEFAULT_BRUSH_SIZE, color = DEFAULT_COLOR, pressureEnabled = true } = options;

  // Latest option values for event handlers, without re-binding listeners.
  const optionsRef = useRef({ brushSize, color, pressureEnabled, onStrokeEnd: options.onStrokeEnd });
  optionsRef.current = { brushSize, color, pressureEnabled, onStrokeEnd: options.onStrokeEnd };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<FreehandStroke[]>([]);
  const activeStrokeRef = useRef<FreehandStroke | null>(null);
  const dprRef = useRef(1);

  const [strokeCount, setStrokeCount] = useState(0);

  /** Replay every committed stroke (and the active one) at current DPR. */
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = dprRef.current;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    const all = activeStrokeRef.current
      ? [...strokesRef.current, activeStrokeRef.current]
      : strokesRef.current;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const stroke of all) {
      ctx.strokeStyle = stroke.color;
      ctx.fillStyle = stroke.color;
      if (stroke.points.length === 1) {
        const point = stroke.points[0];
        ctx.beginPath();
        ctx.arc(point.x, point.y, widthFor(stroke, point) / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      for (let i = 1; i < stroke.points.length; i += 1) {
        const from = stroke.points[i - 1];
        const to = stroke.points[i];
        ctx.beginPath();
        ctx.lineWidth = (widthFor(stroke, from) + widthFor(stroke, to)) / 2;
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    }
  }, []);

  /** Match the backing store to the CSS box; returns true when it changed. */
  const syncDimensions = useCallback((): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width === width && canvas.height === height && dprRef.current === dpr) return false;
    canvas.width = width;
    canvas.height = height;
    dprRef.current = dpr;
    return true;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const el: HTMLCanvasElement = canvas;

    // Touch screens must draw, not scroll, while the pointer is down.
    el.style.touchAction = 'none';

    syncDimensions();
    redraw();

    const observer = new ResizeObserver(() => {
      if (syncDimensions()) redraw();
    });
    observer.observe(canvas);

    function pointFrom(event: PointerEvent): FreehandPoint {
      const rect = el.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        pressure: event.pressure > 0 ? event.pressure : 0.5,
      };
    }

    function drawSegment(stroke: FreehandStroke, from: FreehandPoint, to: FreehandPoint): void {
      const ctx = el.getContext('2d');
      if (!ctx) return;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = (widthFor(stroke, from) + widthFor(stroke, to)) / 2;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }

    function drawDot(stroke: FreehandStroke, point: FreehandPoint): void {
      const ctx = el.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = stroke.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, widthFor(stroke, point) / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    function onPointerDown(event: PointerEvent): void {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      event.preventDefault();
      el.setPointerCapture(event.pointerId);
      const { brushSize: size, color: ink, pressureEnabled: dynamic } = optionsRef.current;
      const stroke: FreehandStroke = {
        size,
        color: ink,
        dynamic: dynamic && event.pointerType === 'pen',
        points: [pointFrom(event)],
      };
      activeStrokeRef.current = stroke;
      drawDot(stroke, stroke.points[0]);
    }

    function onPointerMove(event: PointerEvent): void {
      const stroke = activeStrokeRef.current;
      if (!stroke) return;
      event.preventDefault();
      const point = pointFrom(event);
      const previous = stroke.points[stroke.points.length - 1];
      stroke.points.push(point);
      drawSegment(stroke, previous, point);
    }

    function commit(event: PointerEvent): void {
      const stroke = activeStrokeRef.current;
      if (!stroke) return;
      activeStrokeRef.current = null;
      if (el.hasPointerCapture(event.pointerId)) {
        el.releasePointerCapture(event.pointerId);
      }
      strokesRef.current = [...strokesRef.current, stroke];
      setStrokeCount(strokesRef.current.length);
      optionsRef.current.onStrokeEnd?.(stroke);
    }

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', commit);
    el.addEventListener('pointercancel', commit);

    return () => {
      observer.disconnect();
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', commit);
      el.removeEventListener('pointercancel', commit);
    };
  }, [redraw, syncDimensions]);

  const undo = useCallback(() => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current = strokesRef.current.slice(0, -1);
    setStrokeCount(strokesRef.current.length);
    redraw();
  }, [redraw]);

  const clear = useCallback(() => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current = [];
    setStrokeCount(0);
    redraw();
  }, [redraw]);

  const getStrokes = useCallback(() => strokesRef.current.map((stroke) => ({ ...stroke, points: stroke.points.map((point) => ({ ...point })) })), []);

  return {
    canvasRef,
    undo,
    clear,
    strokeCount,
    isEmpty: strokeCount === 0,
    getStrokes,
  };
}
