// Polyfill for Canvas roundRect method
// Required for Safari < 16 and older browsers
// This ensures drawing tools work across all browsers and deployment environments

export function polyfillCanvasRoundRect() {
  if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(
      x: number,
      y: number,
      width: number,
      height: number,
      radii: number | number[] | DOMPointInit | DOMPointInit[]
    ): void {
      // Normalize radii to a single number for simplicity
      // In production usage, we only pass a single number
      const radius = typeof radii === 'number' ? radii : 0;

      // Clamp radius to prevent oversized corners
      const clampedRadius = Math.min(radius, width / 2, height / 2);

      // Draw rounded rectangle using standard canvas path methods
      this.beginPath();
      this.moveTo(x + clampedRadius, y);
      this.arcTo(x + width, y, x + width, y + height, clampedRadius);
      this.arcTo(x + width, y + height, x, y + height, clampedRadius);
      this.arcTo(x, y + height, x, y, clampedRadius);
      this.arcTo(x, y, x + width, y, clampedRadius);
      this.closePath();
    };
  }
}
