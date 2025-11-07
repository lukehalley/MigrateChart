// Custom vertical line plugin for lightweight-charts
// Draws vertical dashed lines at specific timestamps with labels

export interface VerticalLineOptions {
  time: number;
  color: string;
  label: string;
  lineWidth?: number;
  labelBackgroundColor?: string;
  labelTextColor?: string;
}

export function drawVerticalLines(
  chart: any,
  container: HTMLElement,
  lines: VerticalLineOptions[]
) {
  if (!container) return;

  // Ensure container is positioned relative
  if (container.style.position !== 'absolute' && container.style.position !== 'fixed') {
    container.style.position = 'relative';
  }

  // Create overlay div for custom rendering
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '1';

  container.appendChild(overlay);

  // Function to update line positions
  const updateLines = () => {
    overlay.innerHTML = ''; // Clear existing lines

    const timeScale = chart.timeScale();
    const priceScale = chart.priceScale();

    lines.forEach(line => {
      const coordinate = timeScale.timeToCoordinate(line.time);
      if (coordinate === null) return;

      // Draw vertical line
      const lineEl = document.createElement('div');
      lineEl.style.position = 'absolute';
      lineEl.style.left = `${coordinate}px`;
      lineEl.style.top = '0';
      lineEl.style.bottom = '0';
      lineEl.style.width = `${line.lineWidth || 1}px`;
      lineEl.style.borderLeft = `${line.lineWidth || 1}px dashed ${line.color}`;
      lineEl.style.opacity = '0.6';
      overlay.appendChild(lineEl);

      // Draw label at top
      const labelEl = document.createElement('div');
      labelEl.style.position = 'absolute';
      labelEl.style.left = `${coordinate}px`;
      labelEl.style.top = '10px';
      labelEl.style.transform = 'translateX(-50%)';
      labelEl.style.padding = '4px 8px';
      labelEl.style.backgroundColor = line.labelBackgroundColor || '#161b22';
      labelEl.style.color = line.labelTextColor || '#8b949e';
      labelEl.style.border = `1px solid ${line.color}`;
      labelEl.style.borderRadius = '4px';
      labelEl.style.fontSize = '11px';
      labelEl.style.whiteSpace = 'nowrap';
      labelEl.textContent = line.label;
      overlay.appendChild(labelEl);
    });
  };

  // Initial draw
  updateLines();

  // Update on time scale changes
  chart.timeScale().subscribeVisibleLogicalRangeChange(updateLines);

  return () => {
    overlay.remove();
  };
}
