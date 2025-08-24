#!/bin/bash

echo "🚀 Starting Trison Solar Application..."

# Check if Python virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating Python virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

# Check if Redis is running
echo "🔍 Checking Redis status..."
if ! pgrep -x "redis-server" > /dev/null; then
    echo "⚠️  Redis is not running. Please start Redis first:"
    echo "   brew services start redis"
    echo "   or"
    echo "   sudo systemctl start redis"
    echo ""
    echo "Continuing without Redis..."
fi

# Start FastAPI backend
echo "🌐 Starting FastAPI backend..."
echo "   API will be available at: http://localhost:8000"
echo "   API documentation at: http://localhost:8000/docs"
echo ""

# Run FastAPI in background
python main.py &
FASTAPI_PID=$!

# Wait a moment for FastAPI to start
sleep 3

# Check if FastAPI started successfully
if kill -0 $FASTAPI_PID 2>/dev/null; then
    echo "✅ FastAPI backend started successfully (PID: $FASTAPI_PID)"
else
    echo "❌ Failed to start FastAPI backend"
    exit 1
fi

echo ""
echo "📱 Starting React Native Metro bundler..."
echo "   React Native will be available on your device/simulator"
echo ""

# Start React Native Metro bundler in background
npx react-native start &
METRO_PID=$!

# Wait a moment for Metro to start
sleep 5

# Check if Metro started successfully
if kill -0 $METRO_PID 2>/dev/null; then
    echo "✅ React Native Metro bundler started successfully (PID: $METRO_PID)"
else
    echo "❌ Failed to start React Native Metro bundler"
    kill $FASTAPI_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 Both services are now running!"
echo ""
echo "📱 To run on Android: npx react-native run-android"
echo "🍎 To run on iOS: npx react-native run-ios"
echo ""
echo "🛑 To stop all services, press Ctrl+C"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $FASTAPI_PID 2>/dev/null
    kill $METRO_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait 