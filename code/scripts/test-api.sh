#!/bin/sh
set -e

echo "🧪 Testing Silicon Traveler API..."
echo ""

# Start API server in background
cd /app/apps/api
PORT=3000 node dist/index.js &
API_PID=$!
echo "Started API server (PID: $API_PID)"

# Wait for server to start
sleep 2

# Test health endpoint
echo ""
echo "Testing GET /health..."
wget -qO- localhost:3000/health
echo ""

# Test journey stats
echo ""
echo "Testing GET /api/journey/stats..."
wget -qO- localhost:3000/api/journey/stats | head -10
echo ""

# Test route points
echo ""
echo "Testing GET /api/journey/route?limit=3..."
wget -qO- "localhost:3000/api/journey/route?limit=3" | head -15
echo ""

# Test photos (should be empty)
echo ""
echo "Testing GET /api/photos/latest..."
wget -qO- localhost:3000/api/photos/latest
echo ""

# Cleanup
kill $API_PID 2>/dev/null || true
echo ""
echo "✅ API tests complete"
