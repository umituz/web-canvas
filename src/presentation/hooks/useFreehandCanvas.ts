import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  FreehandPoint,
  FreehandStroke,
  UseFreehandCanvasOptions,
} from '../../domain/types/freehand.types';

const DEFAULT_BRUSH_SIZE = 3;
const DEFAULT_COLOR = '#1a1a1a';
const DEFAULT_KEYBOARD_STEP = 4;
const KEYBOARD_FAST_FACTOR = 4;

function widthFor(stroke: FreehandStroke, point: FreehandPoint): number {
  if (!stroke.dynamic) return stroke.size;
  return stroke.size * (0.5 + Math.min(1, Math.max(0, point.pressure)));
}

export interface UseFreehandCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  undo: () => void;
  clear: () => void;
  strokeCount: number;
  isEmpty: boolean;
  getStrokes: () => FreehandStroke[];
  /** Appends externally-produced strokes (e.g. synced from a peer). */
  applyStrokes: (strokes: FreehandStroke[]) => void;
  /** Replaces the whole stroke list (resync / epoch change / clear-all). */
  replaceStrokes: (strokes: FreehandStroke[]) => void;
  /** Drops the newest stroke without touching history (remote undo). */
  removeLastStroke: () => void;
}

interface KeyboardPen {
  x: number;
  y: number;
  down: boolean;
  engaged: boolean;
}

export function useFreehandCanvas(
  options: UseFreehandCanvasOptions = {}
): UseFreehandCanvasReturn {
  const {
    brushSize = DEFAULT_BRUSH_SIZE,
    color = DEFAULT_COLOR,
    pressureEnabled = true,
    keyboard = false,
    keyboardStep = DEFAULT_KEYBOARD_STEP,
  } = options;

  const optionsRef = useRef({ brushSize, color, pressureEnabled, keyboardStep, onStrokeEnd: options.onStrokeEnd });
  optionsRef.current = { brushSize, color, pressureEnabled, keyboardStep, onStrokeEnd: options.onStrokeEnd };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<FreehandStroke[]>([]);
  const activeStrokeRef = useRef<FreehandStroke | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const dprRef = useRef(1);
  const penRef = useRef<KeyboardPen | null>(null);

  const [strokeCount, setStrokeCount] = useState(0);

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
        if (!point) continue;
        ctx.beginPath();
        ctx.arc(point.x, point.y, widthFor(stroke, point) / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      for (let i = 1; i < stroke.points.length; i += 1) {
        const from = stroke.points[i - 1];
        const to = stroke.points[i];
        if (!from || !to) continue;
        ctx.beginPath();
        ctx.lineWidth = (widthFor(stroke, from) + widthFor(stroke, to)) / 2;
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    }
    const pen = penRef.current;
    if (pen?.engaged && !pen.down) {
      const reach = 5;
      ctx.strokeStyle = 'rgba(35, 37, 43, 0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pen.x - reach, pen.y);
      ctx.lineTo(pen.x + reach, pen.y);
      ctx.moveTo(pen.x, pen.y - reach);
      ctx.lineTo(pen.x, pen.y + reach);
      ctx.stroke();
    }
  }, []);

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

    el.style.touchAction = 'none';
    if (keyboard && !el.hasAttribute('tabindex')) el.tabIndex = 0;
    if (!penRef.current) penRef.current = { x: el.clientWidth / 2, y: el.clientHeight / 2, down: false, engaged: false };

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
      if (activeStrokeRef.current != null) return;
      event.preventDefault();
      el.setPointerCapture(event.pointerId);
      activePointerIdRef.current = event.pointerId;
      const { brushSize: size, color: ink, pressureEnabled: dynamic } = optionsRef.current;
      const point = pointFrom(event);
      const stroke: FreehandStroke = {
        size,
        color: ink,
        dynamic: dynamic && event.pointerType === 'pen',
        points: [point],
      };
      activeStrokeRef.current = stroke;
      penRef.current = { x: point.x, y: point.y, down: false, engaged: false };
      drawDot(stroke, point);
    }

    function onPointerMove(event: PointerEvent): void {
      const stroke = activeStrokeRef.current;
      if (!stroke || event.pointerId !== activePointerIdRef.current) return;
      event.preventDefault();
      const point = pointFrom(event);
      const previous = stroke.points[stroke.points.length - 1];
      if (!previous) return;
      stroke.points.push(point);
      drawSegment(stroke, previous, point);
    }

    function commit(event: PointerEvent): void {
      const stroke = activeStrokeRef.current;
      if (!stroke || event.pointerId !== activePointerIdRef.current) return;
      activeStrokeRef.current = null;
      activePointerIdRef.current = null;
      if (el.hasPointerCapture(event.pointerId)) {
        el.releasePointerCapture(event.pointerId);
      }
      strokesRef.current = [...strokesRef.current, stroke];
      setStrokeCount(strokesRef.current.length);
      optionsRef.current.onStrokeEnd?.(stroke);
    }

    function clampPen(pen: KeyboardPen): void {
      pen.x = Math.min(Math.max(pen.x, 0), Math.max(0, el.clientWidth - 1));
      pen.y = Math.min(Math.max(pen.y, 0), Math.max(0, el.clientHeight - 1));
    }

    function startKeyboardStroke(pen: KeyboardPen): void {
      const { brushSize: size, color: ink } = optionsRef.current;
      const point: FreehandPoint = { x: pen.x, y: pen.y, pressure: 0.5 };
      const stroke: FreehandStroke = {
        size,
        color: ink,
        dynamic: false,
        points: [point],
      };
      activeStrokeRef.current = stroke;
      pen.down = true;
      drawDot(stroke, point);
    }

    function commitKeyboardStroke(pen: KeyboardPen): void {
      const stroke = activeStrokeRef.current;
      if (!stroke) return;
      activeStrokeRef.current = null;
      pen.down = false;
      strokesRef.current = [...strokesRef.current, stroke];
      setStrokeCount(strokesRef.current.length);
      optionsRef.current.onStrokeEnd?.(stroke);
      redraw();
    }

    function onKeyDown(event: KeyboardEvent): void {
      const pen = penRef.current;
      if (!pen) return;
      const fast = event.shiftKey ? KEYBOARD_FAST_FACTOR : 1;
      const step = optionsRef.current.keyboardStep * fast;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        pen.engaged = true;
        pen.x += event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
        pen.y += event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
        clampPen(pen);
        const stroke = activeStrokeRef.current;
        if (pen.down && stroke) {
          const point: FreehandPoint = { x: pen.x, y: pen.y, pressure: 0.5 };
          const previous = stroke.points[stroke.points.length - 1];
          if (!previous) return;
          stroke.points.push(point);
          drawSegment(stroke, previous, point);
        } else {
          redraw();
        }
        return;
      }
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        pen.engaged = true;
        if (pen.down) commitKeyboardStroke(pen);
        else startKeyboardStroke(pen);
        return;
      }
      if (event.key === 'Escape' && pen.down) {
        activeStrokeRef.current = null;
        pen.down = false;
        redraw();
      }
    }

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', commit);
    el.addEventListener('pointercancel', commit);
    if (keyboard) el.addEventListener('keydown', onKeyDown);

    return () => {
      observer.disconnect();
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', commit);
      el.removeEventListener('pointercancel', commit);
      el.removeEventListener('keydown', onKeyDown);
    };
  }, [redraw, syncDimensions, keyboard]);

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

  const cloneStroke = (stroke: FreehandStroke): FreehandStroke => ({
    ...stroke,
    points: stroke.points.map((point) => ({ ...point })),
  });

  const isDrawable = (stroke: FreehandStroke): stroke is FreehandStroke =>
    typeof stroke.color === 'string' && Array.isArray(stroke.points) && stroke.points.length > 0;

  const applyStrokes = useCallback(
    (incoming: FreehandStroke[]) => {
      const usable = incoming.filter(isDrawable).map(cloneStroke);
      if (usable.length === 0) return;
      strokesRef.current = [...strokesRef.current, ...usable];
      setStrokeCount(strokesRef.current.length);
      redraw();
    },
    [redraw],
  );

  const replaceStrokes = useCallback(
    (incoming: FreehandStroke[]) => {
      const usable = incoming.filter(isDrawable).map(cloneStroke);
      strokesRef.current = usable;
      setStrokeCount(usable.length);
      redraw();
    },
    [redraw],
  );

  const removeLastStroke = useCallback(() => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current = strokesRef.current.slice(0, -1);
    setStrokeCount(strokesRef.current.length);
    redraw();
  }, [redraw]);

  return {
    canvasRef,
    undo,
    clear,
    strokeCount,
    isEmpty: strokeCount === 0,
    getStrokes,
    applyStrokes,
    replaceStrokes,
    removeLastStroke,
  };
}
