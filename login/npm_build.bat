@echo off
echo Running npm build...
npm run build

echo Running Docker Compose build...
docker-compose up --build -d

echo Done!
pause
