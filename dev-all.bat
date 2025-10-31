@echo off
REM Start both frontend and backend servers for development
echo Starting Prayer Times Frontend and Backend Servers...
echo.
echo Opening Terminal 1: Frontend (Vite) on http://localhost:5173
echo Opening Terminal 2: Backend (Express) on http://localhost:3001
echo.
start cmd /k "cd /d "%CD%" && npm run dev"
echo Waiting 2 seconds before starting backend...
timeout /t 2 /nobreak
start cmd /k "cd /d "%CD%" && npm run dev:api"
echo.
echo Both servers started. Press Ctrl+C in either window to stop.
