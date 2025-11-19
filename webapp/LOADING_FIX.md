# Loading Animation Fix - Storage Migration

## Problem
After migrating project logos from database inline SVGs to Supabase Storage URLs, the loading animations were not displaying during initial page load.

## Root Cause
The loading state logic had a chicken-and-egg problem:
1. `showLoader` started as `true` on mount
2. But `currentProject` hadn't loaded yet from the API
3. The conditional `{currentProject && <TokenLoadingLogo.../>}` prevented the logo from rendering
4. Result: Backdrop visible (green glow effect) but no logo SVG

## Solution
Changed the loading state strategy in `/app/[token]/page.tsx`:

### 1. Changed Initial State
```typescript
// Before:
const [showLoader, setShowLoader] = useState(true); // Start with true

// After:
const [showLoader, setShowLoader] = useState(false); // Start with false
```

### 2. Updated Loading Logic
The loader now turns ON when:
- We have `currentProject` loaded (so we have the loaderUrl and primaryColor)
- BUT we're still waiting for `poolsData` or `tokenStats`

```typescript
// Turn on loader when we have project but are waiting for pools/stats
if (currentProject && (!poolsData || !tokenStats || isLoading || isStatsLoading)) {
  if (!showLoader && !loaderStartTimeRef.current) {
    loaderStartTimeRef.current = Date.now();
    setShowLoader(true);
  }
}
```

### 3. Simplified Conditional Rendering
```typescript
// In both mobile and desktop views:
{showLoader && currentProject && (
  <motion.div className="flex items-center justify-center h-full backdrop-blur-xl">
    <TokenLoadingLogo
      svgUrl={currentProject.loaderUrl}
      color={currentProject.primaryColor}
    />
  </motion.div>
)}
```

## Result
- Loading animation now displays correctly with the project's logo
- No more black screen with just a green glow
- Smooth transitions with minimum 800ms loader duration
- Works for both Zera and PayAI projects

## Files Modified
- `/app/[token]/page.tsx` (lines 417, 422-488, 1330-1347, 1434-1450)

## Testing
Navigate to:
- http://localhost:3000/zera
- http://localhost:3000/payai

Both should now show the animated logo during initial load.
