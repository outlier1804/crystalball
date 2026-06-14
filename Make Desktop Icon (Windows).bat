@echo off
rem ===========================================================
rem  Puts a "Candle Quest" icon on the Desktop that opens the
rem  live game website. Run this ONCE.
rem ===========================================================
setlocal
set "ICON=%~dp0launcher\icon.ico"
set "DESK=%USERPROFILE%\Desktop"

> "%DESK%\Candle Quest.url" (
  echo [InternetShortcut]
  echo URL=https://crystalball-seven.vercel.app/
  echo IconFile=%ICON%
  echo IconIndex=0
)

echo.
echo   Done! Look for the "Candle Quest" icon on your Desktop.
echo   Double-click it anytime to play.
echo.
pause
