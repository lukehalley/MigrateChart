import {
  ISeriesApi,
  ISeriesPrimitive,
  SeriesAttachedParameter,
  Time,
  ISeriesPrimitivePaneView,
  SeriesPrimitivePaneViewZOrder,
  IChartApi,
  Logical,
} from 'lightweight-charts';

// Types for drawing objects
export type DrawingType = 'horizontal-line' | 'trend-line' | 'freehand' | 'ruler' | 'text-box';

export interface DrawingPoint {
  logical: number; // Using logical index instead of time - works beyond data range
  price: number;
}

export interface HorizontalLineDrawing {
  type: 'horizontal-line';
  id: string;
  price: number;
  color: string;
}

export interface TrendLineDrawing {
  type: 'trend-line';
  id: string;
  point1: DrawingPoint;
  point2: DrawingPoint;
  color: string;
}

export interface FreehandDrawing {
  type: 'freehand';
  id: string;
  points: DrawingPoint[];
  color: string;
}

export interface RulerDrawing {
  type: 'ruler';
  id: string;
  point1: DrawingPoint;
  point2: DrawingPoint;
  color: string;
}

export interface TextBoxDrawing {
  type: 'text-box';
  id: string;
  point: DrawingPoint;
  text: string;
  color: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  width?: number;
  height?: number;
  rotation?: number;
  backgroundColor?: string;
}

export type Drawing = HorizontalLineDrawing | TrendLineDrawing | FreehandDrawing | RulerDrawing | TextBoxDrawing;

// Pane View for rendering drawings
class DrawingPaneView implements ISeriesPrimitivePaneView {
  private _drawings: Drawing[];
  private _series: ISeriesApi<'Candlestick'>;
  private _chart: IChartApi;
  private _hiddenTextBoxIds: Set<string>;

  constructor(drawings: Drawing[], series: ISeriesApi<'Candlestick'>, chart: IChartApi, hiddenTextBoxIds: Set<string>) {
    this._drawings = drawings;
    this._series = series;
    this._chart = chart;
    this._hiddenTextBoxIds = hiddenTextBoxIds;
  }

  zOrder(): SeriesPrimitivePaneViewZOrder {
    return 'top';
  }

  renderer() {
    return {
      draw: (target: any) => {
        target.useBitmapCoordinateSpace((scope: any) => {
          const ctx = scope.context as CanvasRenderingContext2D;
          const scalingFactor = scope.horizontalPixelRatio;

          ctx.save();
          ctx.scale(scalingFactor, scope.verticalPixelRatio);

          this._drawings.forEach((drawing) => {
            // Skip hidden textboxes (being rendered in HTML overlay)
            if (drawing.type === 'text-box' && this._hiddenTextBoxIds.has(drawing.id)) {
              return;
            }

            if (drawing.type === 'horizontal-line') {
              this._drawHorizontalLine(ctx, drawing, scope);
            } else if (drawing.type === 'trend-line') {
              this._drawTrendLine(ctx, drawing);
            } else if (drawing.type === 'freehand') {
              this._drawFreehand(ctx, drawing);
            } else if (drawing.type === 'ruler') {
              this._drawRuler(ctx, drawing, scope);
            } else if (drawing.type === 'text-box') {
              this._drawTextBox(ctx, drawing, scope);
            }
          });

          ctx.restore();
        });
      },
    };
  }

  private _drawHorizontalLine(
    ctx: CanvasRenderingContext2D,
    line: HorizontalLineDrawing,
    scope: any
  ) {
    const y = this._series.priceToCoordinate(line.price);
    if (y === null) return;

    ctx.strokeStyle = line.color;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(scope.bitmapSize.width / scope.horizontalPixelRatio, y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  private _drawTrendLine(
    ctx: CanvasRenderingContext2D,
    line: TrendLineDrawing
  ) {
    if (!this._chart) return;

    const y1 = this._series.priceToCoordinate(line.point1.price);
    const y2 = this._series.priceToCoordinate(line.point2.price);

    // Get time scale from the chart and use logical coordinates
    // logicalToCoordinate works for ANY logical value, including beyond data range
    const timeScale = this._chart.timeScale();
    const x1 = timeScale.logicalToCoordinate(line.point1.logical as Logical);
    const x2 = timeScale.logicalToCoordinate(line.point2.logical as Logical);

    // Skip if any coordinate is invalid
    if (y1 === null || y2 === null || x1 === null || x2 === null) return;

    ctx.strokeStyle = line.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  private _drawFreehand(
    ctx: CanvasRenderingContext2D,
    freehand: FreehandDrawing
  ) {
    if (!this._chart || freehand.points.length < 2) return;

    const timeScale = this._chart.timeScale();

    ctx.strokeStyle = freehand.color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    let started = false;
    for (let i = 0; i < freehand.points.length; i++) {
      const point = freehand.points[i];
      const y = this._series.priceToCoordinate(point.price);
      // Use logicalToCoordinate - works for ANY logical value
      const x = timeScale.logicalToCoordinate(point.logical as Logical);

      if (y === null || x === null) continue;

      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  }

  private _drawRuler(
    ctx: CanvasRenderingContext2D,
    ruler: RulerDrawing,
    scope: any
  ) {
    if (!this._chart) return;

    const y1 = this._series.priceToCoordinate(ruler.point1.price);
    const y2 = this._series.priceToCoordinate(ruler.point2.price);

    const timeScale = this._chart.timeScale();
    const x1 = timeScale.logicalToCoordinate(ruler.point1.logical as Logical);
    const x2 = timeScale.logicalToCoordinate(ruler.point2.logical as Logical);

    if (y1 === null || y2 === null || x1 === null || x2 === null) return;

    // Calculate rectangle dimensions
    const rectX = Math.min(x1, x2);
    const rectY = Math.min(y1, y2);
    const rectWidth = Math.abs(x2 - x1);
    const rectHeight = Math.abs(y2 - y1);

    // Draw filled rectangle with transparency
    ctx.fillStyle = ruler.color + '20'; // 20 = ~12% opacity in hex
    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

    // Draw rectangle border
    ctx.strokeStyle = ruler.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);

    // Draw corner circles
    ctx.fillStyle = ruler.color;
    ctx.beginPath();
    ctx.arc(x1, y1, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x2, y2, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Calculate measurements
    // Use the higher and lower prices regardless of which point is which
    const highPrice = Math.max(ruler.point1.price, ruler.point2.price);
    const lowPrice = Math.min(ruler.point1.price, ruler.point2.price);
    const priceChange = highPrice - lowPrice;

    // Calculate percentage change from the lower price
    const priceChangePercent = ((priceChange / lowPrice) * 100);
    const barDistance = Math.abs(Math.round(ruler.point2.logical - ruler.point1.logical));

    // Format price change with appropriate precision
    const formatPrice = (price: number) => {
      if (Math.abs(price) >= 1) return price.toFixed(2);
      if (Math.abs(price) >= 0.01) return price.toFixed(4);
      return price.toFixed(6);
    };

    // Create measurement text - show price difference and bar count
    const detailsText = `${formatPrice(priceChange)} · ${barDistance} bars`;
    const percentText = `${priceChangePercent.toFixed(2)}%`;

    // Position label at top center of rectangle
    const midX = (x1 + x2) / 2;
    const topY = Math.min(y1, y2);

    // Measure details box dimensions first
    ctx.font = 'bold 11px Inter, system-ui, -apple-system, sans-serif';
    const textMetrics = ctx.measureText(detailsText);
    const textWidth = textMetrics.width;
    const textHeight = 14;
    const padding = 6;
    const boxHeight = textHeight + padding * 2;

    // Position details box above the rectangle with more clearance
    const boxX = midX - textWidth / 2 - padding;
    const boxY = topY - boxHeight - 30; // 30px clearance above rectangle
    const boxWidth = textWidth + padding * 2;

    // Draw percentage text above the details box
    ctx.font = 'bold 14px Inter, system-ui, -apple-system, sans-serif';
    ctx.fillStyle = ruler.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(percentText, midX, boxY - 4); // 4px above the details box

    // Draw details box with green theme
    ctx.fillStyle = ruler.color;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 4);
    ctx.fill();

    // Draw details text in black for contrast against green background
    ctx.font = 'bold 11px Inter, system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(detailsText, midX, boxY + boxHeight / 2);
  }

  private _drawTextBox(
    ctx: CanvasRenderingContext2D,
    textBox: TextBoxDrawing,
    scope: any
  ) {
    if (!this._chart) return;

    const y = this._series.priceToCoordinate(textBox.point.price);
    const timeScale = this._chart.timeScale();
    const x = timeScale.logicalToCoordinate(textBox.point.logical as Logical);

    if (y === null || x === null) return;

    const fontSize = textBox.fontSize || 14;
    const fontFamily = textBox.fontFamily || 'Inter, system-ui, -apple-system, sans-serif';
    const fontWeight = textBox.fontWeight || '400';
    const textAlign = textBox.textAlign || 'left';
    const rotation = textBox.rotation || 0;
    const padding = 12;
    const lineHeight = fontSize * 1.4;

    const totalWidth = textBox.width || 224;
    const totalHeight = textBox.height || 100;
    const contentWidth = totalWidth - (padding * 2);

    // Save current state and reset transform for text rendering
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Scale coordinates manually to bitmap space
    const bitmapX = x * scope.horizontalPixelRatio;
    const bitmapY = y * scope.verticalPixelRatio;
    const bitmapPadding = padding * scope.horizontalPixelRatio;
    const bitmapFontSize = fontSize * scope.verticalPixelRatio;
    const bitmapContentWidth = contentWidth * scope.horizontalPixelRatio;
    const bitmapTotalWidth = totalWidth * scope.horizontalPixelRatio;
    const bitmapTotalHeight = totalHeight * scope.verticalPixelRatio;
    const bitmapLineHeight = lineHeight * scope.verticalPixelRatio;

    // Apply rotation transform around the center of the box
    const centerX = bitmapX + bitmapTotalWidth / 2;
    const centerY = bitmapY + bitmapTotalHeight / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);

    // Set font for measuring (with scaled font size)
    ctx.font = `${fontWeight} ${bitmapFontSize}px ${fontFamily}`;

    // Split text into lines based on content width (excluding padding)
    const words = textBox.text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > bitmapContentWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    // Use the exact total dimensions
    const boxWidth = bitmapTotalWidth;
    const boxHeight = bitmapTotalHeight;

    // Draw background with rounded corners
    const cornerRadius = 8 * scope.horizontalPixelRatio;
    const backgroundColor = textBox.backgroundColor || textBox.color;
    ctx.fillStyle = backgroundColor;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 8 * scope.horizontalPixelRatio;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2 * scope.verticalPixelRatio;

    ctx.beginPath();
    ctx.roundRect(bitmapX, bitmapY, boxWidth, boxHeight, cornerRadius);
    ctx.fill();

    // Reset shadow for text
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Determine text color based on background color brightness
    const rgb = this._hexToRgb(backgroundColor);
    const brightness = rgb ? (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 : 0;
    ctx.fillStyle = brightness > 128 ? '#000000' : '#ffffff';

    // Draw text lines with alignment
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'top';

    lines.forEach((line, index) => {
      const textY = bitmapY + bitmapPadding + index * bitmapLineHeight;
      let textX = bitmapX + bitmapPadding;

      if (textAlign === 'center') {
        textX = bitmapX + boxWidth / 2;
      } else if (textAlign === 'right') {
        textX = bitmapX + boxWidth - bitmapPadding;
      }

      ctx.fillText(line, textX, textY);
    });

    // Restore transform
    ctx.restore();
  }

  private _hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}

// Main Drawing Primitive
export class DrawingToolsPrimitive implements ISeriesPrimitive<Time> {
  private _drawings: Drawing[] = [];
  private _series: ISeriesApi<'Candlestick'> | null = null;
  private _chart: IChartApi | null = null;
  private _requestUpdate?: () => void;
  private _hiddenTextBoxIds: Set<string> = new Set();

  constructor(chart: IChartApi) {
    this._chart = chart;
  }

  // Set which textboxes to hide from canvas rendering (when being edited in HTML overlay)
  setHiddenTextBoxIds(ids: string[]) {
    this._hiddenTextBoxIds = new Set(ids);
    this._requestUpdate?.();
  }

  attached(param: SeriesAttachedParameter<Time>): void {
    this._series = param.series as ISeriesApi<'Candlestick'>;
    this._requestUpdate = param.requestUpdate;
  }

  detached(): void {
    this._series = null;
    this._requestUpdate = undefined;
  }

  paneViews() {
    if (!this._series || !this._chart) return [];
    return [new DrawingPaneView(this._drawings, this._series, this._chart, this._hiddenTextBoxIds)];
  }

  // Add a horizontal line
  addHorizontalLine(price: number, color: string = '#52C97D'): string {
    const id = `h-${Date.now()}-${Math.random()}`;
    this._drawings.push({
      type: 'horizontal-line',
      id,
      price,
      color,
    });
    this._requestUpdate?.();
    return id;
  }

  // Add a trend line
  addTrendLine(
    point1: DrawingPoint,
    point2: DrawingPoint,
    color: string = '#52C97D'
  ): string {
    const id = `t-${Date.now()}-${Math.random()}`;
    this._drawings.push({
      type: 'trend-line',
      id,
      point1,
      point2,
      color,
    });
    this._requestUpdate?.();
    return id;
  }

  // Update the last trend line's second point (for preview while drawing)
  updateLastTrendLinePoint2(point: DrawingPoint): void {
    const lastDrawing = this._drawings[this._drawings.length - 1];
    if (lastDrawing && lastDrawing.type === 'trend-line') {
      lastDrawing.point2 = point;
      this._requestUpdate?.();
    }
  }

  // Start a new freehand drawing
  startFreehand(point: DrawingPoint, color: string = '#52C97D'): string {
    const id = `f-${Date.now()}-${Math.random()}`;
    this._drawings.push({
      type: 'freehand',
      id,
      points: [point],
      color,
    });
    this._requestUpdate?.();
    return id;
  }

  // Add a point to the current freehand drawing
  addFreehandPoint(point: DrawingPoint): void {
    const lastDrawing = this._drawings[this._drawings.length - 1];
    if (lastDrawing && lastDrawing.type === 'freehand') {
      lastDrawing.points.push(point);
      this._requestUpdate?.();
    }
  }

  // Finish the current freehand drawing
  finishFreehand(): void {
    // Just mark it as complete, no special action needed
    this._requestUpdate?.();
  }

  // Add a ruler measurement
  addRuler(
    point1: DrawingPoint,
    point2: DrawingPoint,
    color: string = '#52C97D'
  ): string {
    const id = `r-${Date.now()}-${Math.random()}`;
    this._drawings.push({
      type: 'ruler',
      id,
      point1,
      point2,
      color,
    });
    this._requestUpdate?.();
    return id;
  }

  // Update the last ruler's second point (for preview while drawing)
  updateLastRulerPoint2(point: DrawingPoint): void {
    const lastDrawing = this._drawings[this._drawings.length - 1];
    if (lastDrawing && lastDrawing.type === 'ruler') {
      lastDrawing.point2 = point;
      this._requestUpdate?.();
    }
  }

  // Add a text box
  addTextBox(
    point: DrawingPoint,
    text: string,
    color: string = '#52C97D',
    fontSize?: number,
    width?: number,
    height?: number
  ): string {
    const id = `tb-${Date.now()}-${Math.random()}`;
    this._drawings.push({
      type: 'text-box',
      id,
      point,
      text,
      color: '#000000', // Text color
      backgroundColor: color, // Background color
      fontSize: fontSize || 16,
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontWeight: '400',
      textAlign: 'left',
      width: width || 224,
      height: height || 100,
      rotation: 0,
    });
    this._requestUpdate?.();
    return id;
  }

  // Update text box content
  updateTextBox(id: string, updates: Partial<Omit<TextBoxDrawing, 'type' | 'id'>>): void {
    const drawing = this._drawings.find(d => d.id === id);
    if (drawing && drawing.type === 'text-box') {
      Object.assign(drawing, updates);
      this._requestUpdate?.();
    }
  }

  // Move text box to new position
  moveTextBox(id: string, point: DrawingPoint): void {
    const drawing = this._drawings.find(d => d.id === id);
    if (drawing && drawing.type === 'text-box') {
      drawing.point = point;
      this._requestUpdate?.();
    }
  }

  // Get text box by ID
  getTextBox(id: string): TextBoxDrawing | undefined {
    const drawing = this._drawings.find(d => d.id === id);
    return drawing && drawing.type === 'text-box' ? drawing : undefined;
  }

  // Find text box at coordinates
  findTextBoxAtCoordinates(screenX: number, screenY: number): TextBoxDrawing | null {
    if (!this._series || !this._chart) return null;

    // Iterate through drawings in reverse order (top-most first)
    for (let i = this._drawings.length - 1; i >= 0; i--) {
      const drawing = this._drawings[i];
      if (drawing.type !== 'text-box') continue;

      const textBox = drawing as TextBoxDrawing;
      const y = this._series.priceToCoordinate(textBox.point.price);
      const timeScale = this._chart.timeScale();
      const x = timeScale.logicalToCoordinate(textBox.point.logical as Logical);

      if (y === null || x === null) continue;

      // Calculate text box dimensions - use stored total width
      const fontSize = textBox.fontSize || 14;
      const padding = 12;
      const lineHeight = fontSize * 1.4;
      const totalWidth = textBox.width || 224; // Total width including padding
      const contentWidth = totalWidth - (padding * 2);

      // Simple word wrapping calculation for line count
      const words = textBox.text.split(' ');
      let lineCount = 1;
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length * (fontSize * 0.6) > contentWidth && currentLine) {
          lineCount++;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      const boxWidth = totalWidth;
      const boxHeight = lineCount * lineHeight + padding * 2;

      // Check if coordinates are within the text box
      if (
        screenX >= x &&
        screenX <= x + boxWidth &&
        screenY >= y &&
        screenY <= y + boxHeight
      ) {
        return textBox;
      }
    }

    return null;
  }

  // Remove a drawing by ID
  removeDrawing(id: string): void {
    this._drawings = this._drawings.filter((d) => d.id !== id);
    this._requestUpdate?.();
  }

  // Remove the last drawing (used for canceling in-progress drawings)
  removeLastDrawing(): void {
    if (this._drawings.length > 0) {
      this._drawings.pop();
      this._requestUpdate?.();
    }
  }

  // Clear all drawings
  clearAllDrawings(): void {
    this._drawings = [];
    this._requestUpdate?.();
  }

  // Get all drawings (for persistence)
  getDrawings(): Drawing[] {
    return this._drawings;
  }

  // Set drawings (for loading from storage)
  setDrawings(drawings: Drawing[]): void {
    this._drawings = drawings;
    this._requestUpdate?.();
  }

  // Get drawing count
  getDrawingCount(): number {
    return this._drawings.length;
  }
}

// Drawing state manager
export class DrawingStateManager {
  private _activeToolType: DrawingType | null = null;
  private _isDrawingMode: boolean = false;
  private _isDrawing: boolean = false;
  private _tempPoint: DrawingPoint | null = null;

  setActiveToolType(type: DrawingType | null): void {
    this._activeToolType = type;
  }

  getActiveToolType(): DrawingType | null {
    return this._activeToolType;
  }

  setDrawingMode(enabled: boolean): void {
    this._isDrawingMode = enabled;
    if (!enabled) {
      this._isDrawing = false;
      this._tempPoint = null;
      this._activeToolType = null;
    }
  }

  isDrawingMode(): boolean {
    return this._isDrawingMode;
  }

  setIsDrawing(drawing: boolean): void {
    this._isDrawing = drawing;
  }

  isDrawing(): boolean {
    return this._isDrawing;
  }

  setTempPoint(point: DrawingPoint | null): void {
    this._tempPoint = point;
  }

  getTempPoint(): DrawingPoint | null {
    return this._tempPoint;
  }
}
