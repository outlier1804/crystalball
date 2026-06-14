@echo off
rem ===========================================================
rem  Creates a "Candle Quest" icon on the Desktop that launches
rem  the game. Run this ONCE. Your son can then click the icon
rem  on the desktop anytime to play.
rem ===========================================================
setlocal
set "GAME=%~dp0index.html"
set "ICON=%~dp0launcher\icon.ico"
set "WORK=%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$d=[Environment]::GetFolderPath('Desktop');" ^
  "$s=(New-Object -ComObject WScript.Shell).CreateShortcut($d+'\Candle Quest.lnk');" ^
  "$s.TargetPath=$env:GAME; $s.IconLocation=$env:ICON; $s.WorkingDirectory=$env:WORK;" ^
  "$s.Description='Candle Quest Academy - learn trading the fun way'; $s.Save()"

echo.
echo   All done! Look for the "Candle Quest" icon on your Desktop.
echo   Double-click it anytime to start the game.
echo.
pause
