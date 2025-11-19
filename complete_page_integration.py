#!/usr/bin/env python3
"""Complete the page.tsx integration for burns feature"""

import re

# Read the file
with open('/Users/luke/dev/personal/zera_chart/webapp/app/[token]/page.tsx', 'r') as f:
    content = f.read()

# 1. Update useEffect to include burns validation
old_sync = r"if \(urlView && \['chart', 'fees', 'holders'\]\.includes\(urlView\)\) \{"
new_sync = "if (urlView && ['chart', 'fees', 'holders', 'burns'].includes(urlView)) {"
content = re.sub(old_sync, new_sync, content)

# 2. Add burns timeframe sync in useEffect
old_holders_sync = r"if \(urlHoldersTimeframe && validHoldersTimeframes\.includes\(urlHoldersTimeframe\)\) \{\s+setHoldersTimeframeState\(urlHoldersTimeframe\);\s+\}"
new_holders_sync = """if (urlHoldersTimeframe && validHoldersTimeframes.includes(urlHoldersTimeframe)) {
      setHoldersTimeframeState(urlHoldersTimeframe);
    }
    if (urlBurnsTimeframe && validBurnsTimeframes.includes(urlBurnsTimeframe)) {
      setBurnsTimeframeState(urlBurnsTimeframe);
    }"""
content = re.sub(old_holders_sync, new_holders_sync, content, flags=re.DOTALL)

# 3. Update setViewMode function signature
old_viewmode_sig = r"const setViewMode = \(newViewMode: 'chart' \| 'fees' \| 'holders'\) => \{"
new_viewmode_sig = "const setViewMode = (newViewMode: 'chart' | 'fees' | 'holders' | 'burns') => {"
content = re.sub(old_viewmode_sig, new_viewmode_sig, content)

# 4. Add burns case to setViewMode function - find the holders section and add after it
old_viewmode_body = r"} else if \(newViewMode === 'holders'\) \{\s+params\.delete\('chartTimeframe'\);\s+params\.delete\('feesTimeframe'\);\s+params\.set\('holdersTimeframe', holdersTimeframe\);"
new_viewmode_body = """} else if (newViewMode === 'holders') {
      params.delete('chartTimeframe');
      params.delete('feesTimeframe');
      params.delete('burnsTimeframe');
      params.set('holdersTimeframe', holdersTimeframe);
    } else if (newViewMode === 'burns') {
      params.delete('chartTimeframe');
      params.delete('feesTimeframe');
      params.delete('holdersTimeframe');
      params.set('burnsTimeframe', burnsTimeframe);"""
content = re.sub(old_viewmode_body, new_viewmode_body, content)

# 5. Update chart case to delete burnsTimeframe
old_chart_case = r"} else if \(newViewMode === 'chart'\) \{\s+params\.set\('chartTimeframe', timeframe\);\s+params\.delete\('feesTimeframe'\);\s+params\.delete\('holdersTimeframe'\);"
new_chart_case = """} else if (newViewMode === 'chart') {
      params.set('chartTimeframe', timeframe);
      params.delete('feesTimeframe');
      params.delete('holdersTimeframe');
      params.delete('burnsTimeframe');"""
content = re.sub(old_chart_case, new_chart_case, content)

# 6. Add setBurnsTimeframe function after setHoldersTimeframe
set_holders_func = r"(const setHoldersTimeframe = \(newHoldersTimeframe: '1D' \| '7D' \| '30D' \| '90D' \| 'ALL'\) => \{[^}]+\};)"
add_burns_func = r"\1\n\n  // Update URL when burns timeframe changes\n  const setBurnsTimeframe = (newBurnsTimeframe: '7D' | '30D' | '90D' | 'ALL') => {\n    setBurnsTimeframeState(newBurnsTimeframe);\n    const params = new URLSearchParams(searchParams.toString());\n    params.set('burnsTimeframe', newBurnsTimeframe);\n    const tokenSlug = currentProject?.slug || 'zera';\n    router.push(`/${tokenSlug}?${params.toString()}`, { scroll: false });\n  };"
content = re.sub(set_holders_func, add_burns_func, content, flags=re.DOTALL)

print("✅ All page.tsx functions updated!")

# Write back
with open('/Users/luke/dev/personal/zera_chart/webapp/app/[token]/page.tsx', 'w') as f:
    f.write(content)

print("✅ File saved successfully!")
print("\nChanges applied:")
print("1. Updated useEffect to sync burns timeframe")
print("2. Updated setViewMode to handle burns")
print("3. Added setBurnsTimeframe function")
