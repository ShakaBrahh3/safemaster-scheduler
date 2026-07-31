#!/bin/bash

# SafeMaster Scheduler - Apply Optimizations Script
# This script helps apply the optimizations that have been implemented

set -e

echo "🚀 SafeMaster Scheduler - Applying Optimizations"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Step 1: Backup original App.jsx
print_status "$BLUE" "📋 Step 1: Backing up original App.jsx..."
if [ -f "src/App.jsx" ]; then
    cp src/App.jsx src/App.jsx.backup
    print_status "$GREEN" "✅ Backup created: src/App.jsx.backup"
else
    print_status "$RED" "❌ Original App.jsx not found!"
    exit 1
fi

# Step 2: Replace App.jsx with optimized version
print_status "$BLUE" "📋 Step 2: Replacing App.jsx with optimized version..."
if [ -f "src/App.jsx.new" ]; then
    cp src/App.jsx.new src/App.jsx
    print_status "$GREEN" "✅ App.jsx replaced with optimized version"
else
    print_status "$RED" "❌ Optimized App.jsx.new not found!"
    exit 1
fi

# Step 3: Clean up backup file (optional)
print_status "$BLUE" "📋 Step 3: Cleaning up..."
rm -f src/App.jsx.new
print_status "$GREEN" "✅ Temporary files cleaned up"

# Step 4: Verify the new structure
print_status "$BLUE" "📋 Step 4: Verifying new structure..."
if [ -f "src/App.jsx" ] && [ -f "src/constants/index.js" ] && [ -f "src/utils/index.js" ]; then
    print_status "$GREEN" "✅ All required files are in place"
else
    print_status "$RED" "❌ Some required files are missing!"
    exit 1
fi

echo ""
print_status "$GREEN" "🎉 Optimizations applied successfully!"
echo ""
print_status "$YELLOW" "Next steps:"
echo "1. Run 'npm run dev' to test the application"
echo "2. Check for any console errors"
echo "3. Test all functionality thoroughly"
echo "4. Review the OPTIMIZATIONS_IMPLEMENTED.md file for details"
echo ""
print_status "$YELLOW" "Note: The original App.jsx has been backed up to src/App.jsx.backup"
echo ""

# Show file sizes comparison
echo "File size comparison:"
echo "-------------------"
if [ -f "src/App.jsx.backup" ]; then
    ORIGINAL_SIZE=$(wc -l < src/App.jsx.backup)
    NEW_SIZE=$(wc -l < src/App.jsx)
    REDUCTION=$((ORIGINAL_SIZE - NEW_SIZE))
    PERCENTAGE=$((REDUCTION * 100 / ORIGINAL_SIZE))
    
    echo "Original App.jsx: $ORIGINAL_SIZE lines"
    echo "New App.jsx:      $NEW_SIZE lines"
    echo "Reduction:        $REDUCTION lines ($PERCENTAGE%)"
fi

echo ""
print_status "$GREEN" "✨ Optimization complete!"
