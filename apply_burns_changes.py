#!/usr/bin/env python3
"""Script to apply all burns feature changes to page.tsx"""

import re

# Read the file
with open('/Users/luke/dev/personal/zera_chart/webapp/app/[token]/page.tsx', 'r') as f:
    content = f.read()

# 1. Update view mode types
content = re.sub(
    r"const urlView = searchParams\.get\('view'\) as 'chart' \| 'fees' \| 'holders' \| null;",
    "const urlView = searchParams.get('view') as 'chart' | 'fees' | 'holders' | 'burns' | null;",
    content
)

# 2. Add burns timeframe URL param
content = re.sub(
    r"const urlHoldersTimeframe = searchParams\.get\('holdersTimeframe'\) as '1D' \| '7D' \| '30D' \| '90D' \| 'ALL' \| null;",
    "const urlHoldersTimeframe = searchParams.get('holdersTimeframe') as '1D' | '7D' | '30D' | '90D' | 'ALL' | null;\n  const urlBurnsTimeframe = searchParams.get('burnsTimeframe') as '7D' | '30D' | '90D' | 'ALL' | null;",
    content
)

# 3. Add burns timeframe validation
content = re.sub(
    r"const validHoldersTimeframes = \['1D', '7D', '30D', '90D', 'ALL'\];",
    "const validHoldersTimeframes = ['1D', '7D', '30D', '90D', 'ALL'];\n  const validBurnsTimeframes = ['7D', '30D', '90D', 'ALL'];",
    content
)

# 4. Update initialViewMode validation
content = re.sub(
    r"const initialViewMode = urlView && \['chart', 'fees', 'holders'\]\.includes\(urlView\) \? urlView : 'chart';",
    "const initialViewMode = urlView && ['chart', 'fees', 'holders', 'burns'].includes(urlView) ? urlView : 'chart';",
    content
)

# 5. Add initialBurnsTimeframe
content = re.sub(
    r"const initialHoldersTimeframe = urlHoldersTimeframe && validHoldersTimeframes\.includes\(urlHoldersTimeframe\) \? urlHoldersTimeframe : '30D';",
    "const initialHoldersTimeframe = urlHoldersTimeframe && validHoldersTimeframes.includes(urlHoldersTimeframe) ? urlHoldersTimeframe : '30D';\n  const initialBurnsTimeframe = urlBurnsTimeframe && validBurnsTimeframes.includes(urlBurnsTimeframe) ? urlBurnsTimeframe : '30D';",
    content
)

# 6. Update viewMode state type
content = re.sub(
    r"const \[viewMode, setViewModeState\] = useState<'chart' \| 'fees' \| 'holders'>\(initialViewMode\);",
    "const [viewMode, setViewModeState] = useState<'chart' | 'fees' | 'holders' | 'burns'>(initialViewMode);",
    content
)

# 7. Add burnsTimeframe state
content = re.sub(
    r"const \[holdersTimeframe, setHoldersTimeframeState\] = useState<'1D' \| '7D' \| '30D' \| '90D' \| 'ALL'>\(initialHoldersTimeframe\);",
    "const [holdersTimeframe, setHoldersTimeframeState] = useState<'1D' | '7D' | '30D' | '90D' | 'ALL'>(initialHoldersTimeframe);\n  const [burnsTimeframe, setBurnsTimeframeState] = useState<'7D' | '30D' | '90D' | 'ALL'>(initialBurnsTimeframe);",
    content
)

print("Applied all changes successfully!")
print("Changes made:")
print("1. ✅ Updated view mode types to include 'burns'")
print("2. ✅ Added burns timeframe URL param handling")
print("3. ✅ Added burns timeframe validation")
print("4. ✅ Updated view mode state types")
print("5. ✅ Added burns timeframe state")

# Write the file back
with open('/Users/luke/dev/personal/zera_chart/webapp/app/[token]/page.tsx', 'w') as f:
    f.write(content)

print("\nFile updated successfully!")
