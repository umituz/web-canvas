# @umituz/web-canvas

Comprehensive canvas and screenshot generation library with device frames, patterns, and PDF export.

## Features

- Canvas-based screenshot generation
- Device frame templates (iOS, Android)
- PDF export functionality
- Pattern generation
- HTML2Canvas integration
- Freehand drawing (`useFreehandCanvas`): mouse, touch and stylus with pressure

## Installation

```bash
npm install @umituz/web-canvas
```

## Usage

```typescript
import { generateScreenshot } from '@umituz/web-canvas';

const screenshot = await generateScreenshot({
  url: 'https://example.com',
  device: 'iphone-14-pro',
});
```

### Freehand drawing

```typescript
import { useFreehandCanvas } from '@umituz/web-canvas/hooks';

function SignaturePad() {
  const { canvasRef, undo, clear, isEmpty, strokeCount } = useFreehandCanvas({
    brushSize: 3,
    color: '#1a1a1a',
  });

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: 400, height: 200 }} />
      <button onClick={undo} disabled={strokeCount === 0}>Undo</button>
      <button onClick={clear} disabled={isEmpty}>Clear</button>
    </div>
  );
}
```

The hook attaches pointer-event drawing to the canvas, sizes the backing
store to the CSS box at device-pixel resolution (redrawing on resize),
replays strokes from captured points so `undo`/`clear` are lossless, and
modulates line width with stylus pressure when the pointer reports it.
`touch-action: none` is applied automatically so drawing works on touch
screens. Layer the canvas over your own guide content (e.g. a faint glyph
to trace) for handwriting practice UIs.

Combine with `useCanvasExport` from the same package to download the
drawing as PNG/JPEG/WebP.

## License

MIT
