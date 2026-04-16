#!/bin/sh
set -e

# Odczytaj opcje add-ona z /data/options.json (zapisywane przez HA Supervisor)
PRINTER_NAME=""
if [ -f /data/options.json ]; then
    PRINTER_NAME=$(node -e "
try {
    const opts = JSON.parse(require('fs').readFileSync('/data/options.json', 'utf8'));
    process.stdout.write(opts.printer_name || '');
} catch(e) { process.stdout.write(''); }
")
fi

# /data jest trwalym magazynem add-ona (montowany przez HA Supervisor)
# Tworzymy dowiazanie symboliczne zeby backend zapisywal config/PDF w /data
mkdir -p /data
rm -rf /app/backend/data
ln -sf /data /app/backend/data

export PORT=3001
export PRINTER_NAME

echo "[run.sh] Uruchamianie Generator Kart Matematycznych..."
echo "[run.sh] Port: ${PORT}"
echo "[run.sh] Drukarka: ${PRINTER_NAME:-'(brak)'}"

cd /app/backend
exec node dist/server.js
