# Anchored Text Annotation Tool

## Overview
Professional-grade text annotation tool for the chart interface, featuring rich formatting options, drag-and-drop positioning, and persistent storage.

## Features

### ✨ Core Capabilities
- **Coordinate Anchoring**: Text boxes anchor to specific price/time coordinates
- **Drag & Drop**: Reposition annotations by dragging
- **Resize**: 8 corner/edge handles for precise sizing
- **Rotate**: Dedicated rotation handle for any angle
- **Persistence**: Annotations saved per timeframe in localStorage

### 🎨 Text Formatting
- **Fonts**: Inter, DM Sans, Instrument Sans, Crimson Pro, Fraunces, JetBrains Mono
- **Sizes**: 12px - 48px
- **Weights**: Regular, Medium, Semi-Bold, Bold
- **Styles**: Normal, Italic
- **Decoration**: None, Underline
- **Alignment**: Left, Center, Right
- **Color**: Full color picker

### 🖼️ Visual Styling
- **Background**:
  - Toggle on/off
  - Color picker
  - Opacity slider (0-100%)
- **Border**:
  - Toggle on/off
  - Color picker
  - Width selector (1-4px)
- **Layout**:
  - Padding control (8-24px)
  - Text wrap toggle

### 💾 Template System
- Save current text box style as a reusable template
- Load templates onto new annotations
- Delete unused templates
- Persists across sessions

## User Workflow

### Creating Text Annotations

1. **Activate Tool**
   - Click the "T" (document) icon in the drawing tools section
   - Desktop: Top-left toolbar
   - Mobile: Left-side vertical toolbar

2. **Draw Text Box**
   - Click once to set start corner
   - Drag to define size
   - Click again to place
   - Settings panel opens automatically

3. **Customize**
   - Enter text content
   - Adjust formatting in settings panel
   - Click "Apply" to confirm

### Editing Existing Annotations

**Quick Edit** (Double-click):
- Double-click text box to edit content inline
- Press Escape or click outside to finish

**Full Settings**:
- Select text box (single click)
- Quick toolbar appears above
- Click gear icon for full settings panel
- OR right-click → "Edit Settings"

### Advanced Actions

**Right-Click Context Menu**:
- Edit Settings
- Duplicate (⌘D / Ctrl+D)
- Bring to Front
- Send to Back
- Copy Style
- Delete (Del key)

**Keyboard Shortcuts**:
- `Delete/Backspace`: Remove selected text box
- `⌘D / Ctrl+D`: Duplicate selected text box
- `Escape`: Cancel editing or deselect
- `⌘Enter / Ctrl+Enter`: Exit edit mode

## Technical Details

### Data Structure
```typescript
interface TextBoxDrawing {
  type: 'text-box';
  id: string;
  point: DrawingPoint; // Logical coordinates
  text: string;

  // Text formatting
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  color: string;
  textAlign: 'left' | 'center' | 'right';

  // Background
  backgroundColor: string;
  backgroundOpacity: number;
  backgroundEnabled: boolean;

  // Border
  borderEnabled: boolean;
  borderColor: string;
  borderWidth: number;

  // Layout
  width: number;
  height: number;
  rotation: number;
  padding: number;
  textWrap: boolean;
}
```

### Storage
- Annotations stored in localStorage per timeframe
- Key format: `drawings_{timeframe}`
- Includes all drawing types (lines, freehand, rulers, text)

### Performance
- Efficient canvas rendering
- HTML overlay only for selected/editing text
- Logical coordinate system maintains position across zoom/pan
- Lazy rendering (only visible viewport)

## Design Philosophy

### Aesthetic: "Precision Instrument"
- **Editorial refinement** over generic fintech UI
- **Warm neutral palette** (#F5F3F0) with burgundy accents (#8B4545)
- **Distinctive typography** (Fraunces display + Instrument Sans UI)
- **Purposeful animations** with spring physics
- **Attention to detail** in every interaction

### UI Components

**Quick Toolbar**:
- Lightweight formatting controls
- Appears above selected text box
- Font size/family, bold/italic/underline, color picker
- Settings button for full panel

**Settings Panel**:
- Three tabs: Text, Style, Visibility
- Modal overlay with refined design
- Real-time updates
- Template management

**Context Menu**:
- Right-click actions
- Clean, organized layout
- Keyboard shortcuts displayed
- Elegant animations

## Browser Compatibility
- Chrome/Edge: Full support
- Safari: Full support (with canvas polyfills)
- Firefox: Full support
- Mobile/Touch: Optimized for touch interactions

## Future Enhancements
- Visibility controls (show/hide on specific timeframes)
- Conditional visibility (based on indicator values)
- Export/import annotations
- Collaborative annotations
- More text effects (shadows, outlines)
- Shape backgrounds (not just rounded rectangles)

---

**Implementation**: Components created with exceptional attention to aesthetic detail and user experience, avoiding generic "AI slop" design patterns.
