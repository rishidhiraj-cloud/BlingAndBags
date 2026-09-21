#!/bin/bash
# Double-click this file to serve Bling & Bags locally and open the dashboard.
cd "$(dirname "$0")"
PORT=8765

( sleep 1; open "http://localhost:${PORT}/index.html" ) &

echo "Serving $(pwd) on http://localhost:${PORT}"
echo "Press Ctrl-C to stop."
exec python3 -m http.server "${PORT}"
