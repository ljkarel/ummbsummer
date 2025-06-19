#!/bin/bash
set -e

echo "Building frontend..."
npm run build

echo "Creating /usr/share/nginx/html/dist if it doesn't exist..."
sudo mkdir -p /usr/share/nginx/html/dist

echo "Clearing old files in /usr/share/nginx/html/dist..."
sudo rm -rf /usr/share/nginx/html/dist/*

echo "Copying new build to /usr/share/nginx/html/dist..."
sudo cp -r dist/* /usr/share/nginx/html/dist/

echo "Fixing permissions..."
sudo chown -R nginx:nginx /usr/share/nginx/html/dist
sudo chmod -R 755 /usr/share/nginx/html/dist

echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "Frontend successfully deployed to /usr/share/nginx/html/dist"
