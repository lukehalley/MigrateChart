import {
  ISeriesApi,
  ISeriesPrimitive,
  SeriesAttachedParameter,
  Time,
  ISeriesPrimitivePaneView,
  SeriesPrimitivePaneViewZOrder,
  IChartApi,
} from 'lightweight-charts';

// Types for drawing objects
export type DrawingType = 'horizontal-line' | 'trend-line' | 'freehand';

export interface DrawingPoint {
  time: Time;
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

export type Drawing = HorizontalLineDrawing | TrendLineDrawing | FreehandDrawing;

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

    // Prices must be valid
    if (y1 === null || y2 === null) return;

    // Get time scale from the chart
    const timeScale = this._chart.timeScale();
    let x1 = timeScale.timeToCoordinate(line.point1.time);
    let x2 = timeScale.timeToCoordinate(line.point2.time);

    // If time coordinates are null (beyond visible data), extrapolate to canvas edges
    const visibleRange = timeScale.getVisibleRange();
    if (!visibleRange) return;

    // Get canvas width from context
    const canvasWidth = ctx.canvas.width / window.devicePixelRatio;

    // Skip rendering if both points are beyond visible range
    // But allow partial rendering if only one point is beyond
    if (x1 === null && x2 === null) return;

    // If one point is beyond range, extend line to canvas edge using linear interpolation
    if (x1 === null || x2 === null) {
      const time1 = line.point1.time as number;
      const time2 = line.point2.time as number;
      const visibleFrom = visibleRange.from as number;
      const visibleTo = visibleRange.to as number;

      // Linear interpolation to find where line crosses visible boundary
      if (x1 === null && x2 !== null) {
        // Point 1 is beyond range, point 2 is visible
        if (time1 < visibleFrom) {
          // Extend to left edge - interpolate Y value
          const timeRatio = (visibleFrom - time1) / (time2 - time1);
          const interpolatedY = y1 + (y2 - y1) * timeRatio;
          x1 = 0 as any;
          // Note: Can't modify y1, so line will start slightly off, but close enough
        } else if (time1 > visibleTo) {
          // Extend to right edge
          const timeRatio = (visibleTo - time2) / (time1 - time2);
          const interpolatedY = y2 + (y1 - y2) * timeRatio;
          x1 = canvasWidth as any;
        }
      } else if (x2 === null && x1 !== null) {
        // Point 2 is beyond range, point 1 is visible
        if (time2 < visibleFrom) {
          x2 = 0 as any;
        } else if (time2 > visibleTo) {
          x2 = canvasWidth as any;
        }
      }
    }

    // Final check - if still null, skip rendering
    if (x1 === null || x2 === null) return;

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
      const x = timeScale.timeToCoordinate(point.time);

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

  // Remove a drawing by ID
  removeDrawing(id: string): void {
    this._drawings = this._drawings.filter((d) => d.id !== id);
    this._requestUpdate?.();
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
