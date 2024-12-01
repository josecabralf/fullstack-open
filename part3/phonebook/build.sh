#!/bin/bash
set -e

BACKEND_DIR="./backend"
FRONTEND_DIR="./frontend"

# Navigate to the project directory
echo "Building backend..."
cd "$BACKEND_DIR"
npm install

# Build frontend
echo "Building frontend..."
cd ..
cd "$FRONTEND_DIR"
npm install
npm run build

# Move the build output to the specified directory
echo "Moving build output to backend directory..."
cd ..
mv "$FRONTEND_DIR/dist" "$BACKEND_DIR/public"

echo "Build completed successfully"