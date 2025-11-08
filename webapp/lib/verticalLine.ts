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
    const isMobile = window.innerWidth < 768;

    lines.forEach(line => {
      const coordinate = timeScale.timeToCoordinate(line.time);

      // Skip markers outside visible range
      if (coordinate === null || coordinate < 0 || coordinate > container.clientWidth) {
        return;
      }

      // Draw vertical line
      const lineEl = document.createElement('div');
      lineEl.style.position = 'absolute';
      lineEl.style.left = `${coordinate}px`;
      lineEl.style.top = '0';
      lineEl.style.bottom = '0';
      lineEl.style.width = '2px';
      lineEl.style.borderLeft = '2px dashed #52C97D';
      lineEl.style.opacity = '0.6';
      lineEl.style.boxShadow = '0 0 8px rgba(82, 201, 125, 0.2)';
      overlay.appendChild(lineEl);

      // Draw label - responsive positioning and sizing
      const labelEl = document.createElement('div');
      labelEl.style.position = 'absolute';
      labelEl.style.left = `${coordinate}px`;
      labelEl.style.top = isMobile ? '20px' : '30px';
      labelEl.style.transform = 'translateX(-50%)';
      labelEl.style.padding = isMobile ? '3px 5px' : '4px 8px';
      labelEl.style.backgroundColor = line.labelBackgroundColor || '#000000';
      labelEl.style.color = line.labelTextColor || '#52C97D';
      labelEl.style.border = `2px solid ${line.color}`;
      labelEl.style.borderRadius = isMobile ? '3px' : '4px';
      labelEl.style.fontSize = isMobile ? '7px' : '10px';
      labelEl.style.fontWeight = '600';
      labelEl.style.whiteSpace = 'nowrap';
      labelEl.style.boxShadow = `0 0 15px ${line.color}80, inset 0 0 10px ${line.color}20`;
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
