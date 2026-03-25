#!/usr/bin/env bash
set -euo pipefail

# Ensure SQLite lives in a persistent instance path outside /var/app/current
# so deploy bundle replacement does not reset the database.

APP_USER="${APP_USER:-webapp}"
APP_GROUP="${APP_GROUP:-webapp}"
PERSISTENT_DIR="/var/app/data"
PERSISTENT_DB="$PERSISTENT_DIR/justingritten.db"
CURRENT_DB="/var/app/current/justingritten.db"

log() {
  echo "[sqlite-persistent-path] $1"
}

log "Ensuring persistent data directory exists at $PERSISTENT_DIR ..."
mkdir -p "$PERSISTENT_DIR"
chown "$APP_USER:$APP_GROUP" "$PERSISTENT_DIR" || true
chmod 775 "$PERSISTENT_DIR" || true

# One-time migration path: if old db exists in /var/app/current and new location
# is empty, copy it so existing data is preserved on the first deploy after switch.
if [ ! -f "$PERSISTENT_DB" ] && [ -f "$CURRENT_DB" ]; then
  log "Migrating DB from $CURRENT_DB to $PERSISTENT_DB ..."
  cp "$CURRENT_DB" "$PERSISTENT_DB"
fi

if [ -f "$PERSISTENT_DB" ]; then
  chown "$APP_USER:$APP_GROUP" "$PERSISTENT_DB" || true
  chmod 664 "$PERSISTENT_DB" || true
  log "Persistent DB ready at $PERSISTENT_DB."
else
  log "No existing DB found yet at $PERSISTENT_DB; app will create it on startup."
fi
