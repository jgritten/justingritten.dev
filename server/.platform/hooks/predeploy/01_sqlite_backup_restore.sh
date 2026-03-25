#!/usr/bin/env bash
set -euo pipefail

# Back up the currently running SQLite DB to S3, then restore latest backup
# into the staging app folder so the next deployed version keeps data.

BUCKET="${SQLITE_BACKUP_BUCKET:-${EB_S3_BUCKET:-elasticbeanstalk-us-east-1-305137865693}}"
PREFIX="${SQLITE_BACKUP_PREFIX:-sqlite-backups/justingritten-api-dev}"
CURRENT_DB="/var/app/current/justingritten.db"
STAGING_DB="/var/app/staging/justingritten.db"
TIMESTAMP="$(date -u +"%Y%m%dT%H%M%SZ")"

log() {
  echo "[sqlite-backup-restore] $1"
}

backup_current_db() {
  if [ ! -f "$CURRENT_DB" ]; then
    log "No current DB found at $CURRENT_DB; skipping backup."
    return
  fi

  log "Backing up current DB to s3://$BUCKET/$PREFIX/ ..."
  aws s3 cp "$CURRENT_DB" "s3://$BUCKET/$PREFIX/history/justingritten-$TIMESTAMP.db" --region us-east-1
  aws s3 cp "$CURRENT_DB" "s3://$BUCKET/$PREFIX/latest/justingritten.db" --region us-east-1
}

restore_latest_db_to_staging() {
  if [ -f "$STAGING_DB" ]; then
    log "Staging DB already present at $STAGING_DB; skipping restore."
    return
  fi

  log "Attempting restore from s3://$BUCKET/$PREFIX/latest/justingritten.db ..."
  if aws s3 cp "s3://$BUCKET/$PREFIX/latest/justingritten.db" "$STAGING_DB" --region us-east-1; then
    log "Restore completed into staging."
  else
    log "No latest backup found in S3; continuing without restore."
  fi
}

backup_current_db
restore_latest_db_to_staging
