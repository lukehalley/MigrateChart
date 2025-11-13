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
export type DrawingType = 'horizontal-line' | 'trend-line' | 'freehand' | 'ruler';

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

export type Drawing = HorizontalLineDrawing | TrendLineDrawing | FreehandDrawing | RulerDrawing;

// Pane View for rendering drawings
class DrawingPaneView implements ISeriesPrimitivePaneView {
  private _drawings: Drawing[];
  private _series: ISeriesApi<'Candlestick'>;
  private _chart: IChartApi;

  constructor(drawings: Drawing[], series: ISeriesApi<'Candlestick'>, chart: IChartApi) {
    this._drawings = drawings;
    this._series = series;
    this._chart = chart;
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
            if (drawing.type === 'horizontal-line') {
              this._drawHorizontalLine(ctx, drawing, scope);
            } else if (drawing.type === 'trend-line') {
              this._drawTrendLine(ctx, drawing);
            } else if (drawing.type === 'freehand') {
              this._drawFreehand(ctx, drawing);
            } else if (drawing.type === 'ruler') {
              this._drawRuler(ctx, drawing, scope);
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

    // Draw percentage text above the box
    ctx.font = 'bold 14px Inter, system-ui, -apple-system, sans-serif';
    ctx.fillStyle = ruler.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(percentText, midX, topY - 24); // 24px above the box

    // Draw details box below percentage
    ctx.font = 'bold 11px Inter, system-ui, -apple-system, sans-serif';
    const textMetrics = ctx.measureText(detailsText);
    const textWidth = textMetrics.width;
    const textHeight = 14;
    const padding = 6;

    // Position box just above the rectangle
    const boxX = midX - textWidth / 2 - padding;
    const boxY = topY - 20;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = textHeight + padding * 2;

    // Draw background box with green theme
    ctx.fillStyle = ruler.color;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 4);
    ctx.fill();

    // Draw text in black for contrast against green background
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(detailsText, midX, boxY + boxHeight / 2);
  }
}

// Main Drawing Primitive
export class DrawingToolsPrimitive implements ISeriesPrimitive<Time> {
  private _drawings: Drawing[] = [];
  private _series: ISeriesApi<'Candlestick'> | null = null;
  private _chart: IChartApi | null = null;
  private _requestUpdate?: () => void;

  constructor(chart: IChartApi) {
    this._chart = chart;
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
    return [new DrawingPaneView(this._drawings, this._series, this._chart)];
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
