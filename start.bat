@echo off
echo Installing dependencies...
call npm run install-all
echo.
echo Starting server and client...
call npm run dev

