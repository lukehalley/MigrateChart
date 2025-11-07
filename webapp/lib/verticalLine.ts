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
      let coordinate = timeScale.timeToCoordinate(line.time);

      // WORKAROUND: If coordinate is null (data gap), estimate position using logical range
      if (coordinate === null) {
        const logicalRange = timeScale.getVisibleLogicalRange();
        if (logicalRange) {
          // Try to find logical position for this timestamp
          const allData = chart.series().data();

          // Find where this timestamp would fit in the data
          let logicalPosition = null;
          for (let i = 0; i < allData.length; i++) {
            const dataTime = allData[i].time;
            if (typeof dataTime === 'number' && dataTime >= line.time) {
              logicalPosition = i;
              break;
            }
          }

          // If we found a logical position, convert it to coordinate
          if (logicalPosition !== null && logicalPosition >= logicalRange.from && logicalPosition <= logicalRange.to) {
            const rangeWidth = logicalRange.to - logicalRange.from;
            const positionInRange = (logicalPosition - logicalRange.from) / rangeWidth;
            coordinate = positionInRange * container.clientWidth;
            console.log(`Marker "${line.label}" in data gap - using estimated position at ${coordinate}px`);
          }
        }
      }

      // Allow markers with slight tolerance outside visible range (within 50px)
      const tolerance = 50;
      if (coordinate === null || coordinate < -tolerance || coordinate > container.clientWidth + tolerance) {
        console.log(`Skipping marker "${line.label}" - too far outside visible range`);
        return;
      }

      // Clamp coordinate to visible area for drawing
      const clampedCoordinate = Math.max(0, Math.min(container.clientWidth, coordinate));

      // Draw vertical line
      const lineEl = document.createElement('div');
      lineEl.style.position = 'absolute';
      lineEl.style.left = `${clampedCoordinate}px`;
      lineEl.style.top = '0';
      lineEl.style.bottom = '0';
      lineEl.style.width = `${line.lineWidth || 1}px`;
      lineEl.style.borderLeft = `${line.lineWidth || 1}px dashed ${line.color}`;
      lineEl.style.opacity = '0.8';
      lineEl.style.boxShadow = `0 0 10px ${line.color}, 0 0 20px ${line.color}40`;
      overlay.appendChild(lineEl);

      // Draw label - positioned to align under enlarged floating card
      const labelEl = document.createElement('div');
      labelEl.style.position = 'absolute';
      labelEl.style.left = `${clampedCoordinate}px`;
      labelEl.style.top = '260px';
      labelEl.style.transform = 'translateX(-50%)';
      labelEl.style.padding = '6px 12px';
      labelEl.style.backgroundColor = line.labelBackgroundColor || '#000000';
      labelEl.style.color = line.labelTextColor || '#52C97D';
      labelEl.style.border = `2px solid ${line.color}`;
      labelEl.style.borderRadius = '6px';
      labelEl.style.fontSize = '12px';
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
