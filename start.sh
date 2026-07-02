#!/bin/bash
echo "--- Starting Risk Analytics Platform ---"
docker compose down --quiet
docker compose build --quiet
docker compose up -d
echo "✅ Backend & Database: Online"
echo "✅ Frontend: Compiling..."
echo "--------------------------------------------------"
echo "🚀 Application started! Visit http://localhost:3000"
echo "--------------------------------------------------"
docker compose logs -f --tail 0