#!/bin/sh
echo "⏳ Waiting for MongoDB to be ready..."
sleep 3

echo "🌱 Running database seed..."
node seed.js

echo "🚀 Starting backend server..."
exec node index.js
