#!/bin/bash
# ============================================================
# Script Backup toàn bộ hệ thống webcq (PayloadCMS + PostgreSQL)
# 
# Cách cài đặt trên server:
#   chmod +x /opt/backup-webcq.sh
#   crontab -e
#   Thêm dòng:  0 2 * * * /opt/backup-webcq.sh >> /var/log/webcq-backup.log 2>&1
#
# Cách khôi phục Database:
#   docker exec -i <postgres_container> pg_restore -U postgres -d webcq < db_YYYY-MM-DD.dump
#
# Cách khôi phục Media:
#   tar -xzf media_YYYY-MM-DD.tar.gz -C /đường/dẫn/media/
# ============================================================

set -e

# ========== CẤU HÌNH — SỬA PHẦN NÀY ==========
BACKUP_DIR="/opt/backups/webcq"       # Thư mục lưu backup trên server
RETAIN_DAYS=7                          # Giữ bao nhiêu ngày backup

DB_USER="postgres"
DB_PASS="123456"
DB_HOST="127.0.0.1"
DB_PORT="5432"
DB_NAME="webcq"

# Đường dẫn thư mục Media trong Docker Volume
# Tìm bằng lệnh: docker volume ls | grep -i media
# Sau đó: docker volume inspect <volume_name>
MEDIA_VOLUME_NAME="webcq_media"        # Tên volume Docker (điều chỉnh nếu cần)
MEDIA_PATH="/var/lib/docker/volumes/${MEDIA_VOLUME_NAME}/_data"
# ===============================================

DATE=$(date +"%Y-%m-%d_%H-%M")
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')]"

echo "========================================"
echo "$LOG_PREFIX Bắt đầu backup hệ thống webcq"
echo "========================================"

# === CHUẨN BỊ THƯ MỤC ===
mkdir -p "$BACKUP_DIR/db"
mkdir -p "$BACKUP_DIR/media"
mkdir -p "$BACKUP_DIR/logs"

# === BACKUP DATABASE ===
echo ""
echo "$LOG_PREFIX 1. Backup PostgreSQL Database..."
export PGPASSWORD="$DB_PASS"

# Tìm container postgres của webcq
POSTGRES_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E "postgres|db" | grep -i "webcq\|payload\|cdc" | head -1)

if [ -n "$POSTGRES_CONTAINER" ]; then
  echo "   Dùng container: $POSTGRES_CONTAINER"
  docker exec "$POSTGRES_CONTAINER" \
    pg_dump -U "$DB_USER" -d "$DB_NAME" -F c \
    > "$BACKUP_DIR/db/db_$DATE.dump"
else
  echo "   Không tìm thấy container, kết nối trực tiếp..."
  pg_dump -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -F c \
    -f "$BACKUP_DIR/db/db_$DATE.dump"
fi

DB_SIZE=$(du -sh "$BACKUP_DIR/db/db_$DATE.dump" | cut -f1)
echo "   ✅ Database OK — $BACKUP_DIR/db/db_$DATE.dump ($DB_SIZE)"

# === BACKUP MEDIA ===
echo ""
echo "$LOG_PREFIX 2. Backup thư mục Media..."

if [ -d "$MEDIA_PATH" ]; then
  FILE_COUNT=$(find "$MEDIA_PATH" -type f | wc -l)
  tar -czf "$BACKUP_DIR/media/media_$DATE.tar.gz" -C "$MEDIA_PATH" . 2>/dev/null || true
  MEDIA_SIZE=$(du -sh "$BACKUP_DIR/media/media_$DATE.tar.gz" | cut -f1)
  echo "   ✅ Media OK — $FILE_COUNT files ($MEDIA_SIZE) → $BACKUP_DIR/media/media_$DATE.tar.gz"
else
  echo "   ⚠️  Không tìm thấy Docker Volume: $MEDIA_PATH"
  echo "   Hãy kiểm tra lại: docker volume inspect $MEDIA_VOLUME_NAME"
fi

# === XÓA BẢN CŨ ===
echo ""
echo "$LOG_PREFIX 3. Dọn dẹp backup cũ hơn $RETAIN_DAYS ngày..."
find "$BACKUP_DIR/db"    -type f -mtime +"$RETAIN_DAYS" -delete 2>/dev/null || true
find "$BACKUP_DIR/media" -type f -mtime +"$RETAIN_DAYS" -delete 2>/dev/null || true
echo "   ✅ Hoàn tất"

# === TỔNG KẾT ===
echo ""
echo "========================================"
echo "$LOG_PREFIX Backup hoàn tất!"
echo "Tổng dung lượng backup: $(du -sh "$BACKUP_DIR" | cut -f1)"
echo "========================================"
