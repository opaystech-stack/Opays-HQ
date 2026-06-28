#!/usr/bin/env bash
#
# backup.sh — Snapshot du volume de données Opays HQ (base SQLite + coffre-fort).
#
# À exécuter sur l'hôte Dokploy. Sauvegarde le répertoire de données dans une
# archive horodatée et applique une rétention (suppression des sauvegardes
# au-delà de RETENTION_DAYS). À lancer avant chaque mise à jour (et/ou via cron).
#
# Variables d'environnement (optionnelles) :
#   DATA_DIR        Répertoire de données à sauvegarder   (défaut: /data/opays-hq)
#   BACKUP_DIR      Répertoire de destination des archives (défaut: /data/backups/opays-hq)
#   RETENTION_DAYS  Nombre de jours de rétention           (défaut: 14)
#
# Usage :
#   ./backup.sh
#   DATA_DIR=/data/opays-hq BACKUP_DIR=/mnt/backups ./backup.sh

set -euo pipefail

DATA_DIR="${DATA_DIR:-/data/opays-hq}"
BACKUP_DIR="${BACKUP_DIR:-/data/backups/opays-hq}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

timestamp="$(date +%Y%m%d-%H%M%S)"
archive="${BACKUP_DIR}/opays-hq-${timestamp}.tar.gz"

if [ ! -d "${DATA_DIR}" ]; then
  echo "❌ DATA_DIR introuvable : ${DATA_DIR}" >&2
  exit 1
fi

mkdir -p "${BACKUP_DIR}"

# Archive compressée du répertoire de données (DB SQLite + WAL + vault/).
# --warning=no-file-changed : WAL peut bouger pendant l'archivage, on tolère.
tar -czf "${archive}" -C "$(dirname "${DATA_DIR}")" "$(basename "${DATA_DIR}")" \
  --warning=no-file-changed || true

if [ -f "${archive}" ]; then
  size="$(du -h "${archive}" | cut -f1)"
  echo "✅ Sauvegarde créée : ${archive} (${size})"
else
  echo "❌ Échec de la création de l'archive" >&2
  exit 1
fi

# Rétention : supprime les archives plus anciennes que RETENTION_DAYS jours.
find "${BACKUP_DIR}" -name 'opays-hq-*.tar.gz' -type f -mtime "+${RETENTION_DAYS}" -delete
echo "🧹 Rétention appliquée (> ${RETENTION_DAYS} jours supprimés)."
