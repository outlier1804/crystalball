#!/bin/bash
# Puts a "Candle Quest" icon (an alias of the app, with the cool icon) on the Desktop.
# Run this ONCE. Your son can then click the Desktop icon anytime to play.
cd "$(dirname "$0")" || exit 1
APP="$(pwd)/Candle Quest.app"

# make sure the app's launcher is executable (downloads sometimes drop the bit)
chmod +x "$APP/Contents/MacOS/launch" 2>/dev/null

osascript <<OSA
tell application "Finder"
  try
    set existing to (every item of (desktop as alias list) whose name is "Candle Quest")
    repeat with e in existing
      delete e
    end repeat
  end try
  set a to make alias file to POSIX file "$APP" at desktop
  set name of a to "Candle Quest"
end tell
OSA

echo ""
echo "  Done! A 'Candle Quest' icon is now on the Desktop."
echo "  Double-click it anytime to play."
echo ""
