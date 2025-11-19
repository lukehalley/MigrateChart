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
  lines: VerticalLineOptions[],
  primaryColor: string = '#52C97D'
) {
  if (!container) return;

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Ensure container is positioned relative
  if (container.style.position !== 'absolute' && container.style.position !== 'fixed') {
    container.style.position = 'relative';
  }

  // Create overlay div for custom rendering
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    opacity: 0;
    transition: opacity 500ms ease-out;
  `;

  container.appendChild(overlay);

  // Trigger fade in after element is in DOM
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });
  });

  // Function to update line positions (no fade - instant update for pan/zoom)
  const updateLines = () => {
    overlay.innerHTML = ''; // Clear existing lines instantly
    renderLines();
  };

  const renderLines = () => {
    const timeScale = chart.timeScale();
    const isMobile = window.innerWidth < 768;

    // Create invisible protective box under price axis for label clearance
    const priceAxisProtection = document.createElement('div');
    priceAxisProtection.style.position = 'absolute';
    priceAxisProtection.style.right = '0';
    priceAxisProtection.style.top = '0';
    priceAxisProtection.style.width = isMobile ? '60px' : '80px';  // Width to cover price axis
    priceAxisProtection.style.height = isMobile ? '120px' : '90px';  // Height to cover top area including where labels sit
    priceAxisProtection.style.pointerEvents = 'none';
    priceAxisProtection.style.zIndex = '2';  // Above migration lines but below chart controls
    overlay.appendChild(priceAxisProtection);

    lines.forEach(line => {
      const coordinate = timeScale.timeToCoordinate(line.time);

      // Calculate price axis width for fade effect
      const priceAxisWidth = isMobile ? 60 : 80;
      const fadeStartDistance = isMobile ? 30 : 80; // Very minimal fade - labels stay visible much longer
      const fadeEndDistance = isMobile ? 10 : 30; // Fade completes right at the axis edge
      const fadeStart = container.clientWidth - priceAxisWidth - fadeStartDistance;
      const fadeEnd = container.clientWidth - priceAxisWidth - fadeEndDistance;

      // Skip markers outside visible range
      if (coordinate === null || coordinate < 0 || coordinate > container.clientWidth) {
        return;
      }

      // Calculate opacity based on distance from price axis
      let opacity = 1;
      if (coordinate > fadeStart) {
        if (coordinate >= fadeEnd) {
          return; // Completely hidden past fadeEnd
        }
        // Linear fade from 1 to 0 between fadeStart and fadeEnd
        const fadeRange = fadeEnd - fadeStart;
        const distanceIntoFade = coordinate - fadeStart;
        opacity = 1 - (distanceIntoFade / fadeRange);
      }

      // Draw vertical line
      const lineEl = document.createElement('div');
      lineEl.style.position = 'absolute';
      lineEl.style.left = `${coordinate}px`;
      lineEl.style.top = '0';
      lineEl.style.bottom = '0';
      lineEl.style.width = '2px';
      lineEl.style.borderLeft = `2px dashed ${primaryColor}`;
      lineEl.style.opacity = String(0.6 * opacity);
      lineEl.style.boxShadow = `0 0 8px ${hexToRgba(primaryColor, 0.2)}`;
      overlay.appendChild(lineEl);

      // Draw label - centered on the line
      const labelEl = document.createElement('div');
      labelEl.style.position = 'absolute';
      labelEl.style.left = `${coordinate}px`;
      labelEl.style.top = isMobile ? '90px' : '30px';
      labelEl.style.transform = 'translateX(-50%)';
      labelEl.style.padding = isMobile ? '5px 7px' : '7px 12px';
      labelEl.style.backgroundColor = line.labelBackgroundColor || '#000000';
      labelEl.style.color = line.labelTextColor || primaryColor;
      labelEl.style.border = `2px solid ${line.color}`;
      labelEl.style.borderRadius = isMobile ? '3px' : '4px';
      labelEl.style.fontSize = isMobile ? '9px' : '12px';
      labelEl.style.fontWeight = '600';
      labelEl.style.textAlign = 'center';
      labelEl.style.lineHeight = isMobile ? '1.3' : '1.4';
      labelEl.style.boxShadow = `0 0 15px ${line.color}80, inset 0 0 10px ${line.color}20`;
      labelEl.style.opacity = String(opacity);
      labelEl.style.whiteSpace = 'nowrap';
      labelEl.innerHTML = line.label; // Use innerHTML to support <br/> tags
      overlay.appendChild(labelEl);
    });
  };

  // Initial draw
  renderLines();

  // Update on time scale changes
  chart.timeScale().subscribeVisibleLogicalRangeChange(updateLines);

  return () => {
    // Unsubscribe from time scale changes to prevent memory leak
    chart.timeScale().unsubscribeVisibleLogicalRangeChange(updateLines);

    // Fade out by changing opacity
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
    }, 500); // Match transition duration
  };
}
