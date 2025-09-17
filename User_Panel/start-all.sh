#!/bin/bash

echo "Starting SmartTransit System..."
echo

# Function to start service in background
start_service() {
    local name=$1
    local dir=$2
    local port=$3
    local command=$4
    
    echo "Starting $name (Port $port)..."
    cd "$dir" && $command &
    local pid=$!
    echo "$name started with PID $pid"
    cd ..
}

# Start Backend Server
start_service "Backend Server" "../Driver_Panel/backend" "5000" "npm run dev"

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Start User Panel
start_service "User Panel" "frontend" "3000" "npm run dev"

# Start Driver Panel
start_service "Driver Panel" "../Driver_Panel/frontend" "3001" "npm run dev"

echo
echo "All services starting..."
echo "- Backend: http://localhost:5000"
echo "- User Panel: http://localhost:3000"
echo "- Driver Panel: http://localhost:3001"
echo
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait
