# @umituz/web-canvas

Comprehensive canvas and screenshot generation library with device frames, patterns, and PDF export.

## Features

- Canvas-based screenshot generation
- Device frame templates (iOS, Android)
- PDF export functionality
- Pattern generation
- HTML2Canvas integration

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

## License

MIT
