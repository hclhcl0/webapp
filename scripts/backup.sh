#!/bin/bash
# ============================================================
# Script Backup Tự Động: PostgreSQL + Media lên Google Drive
# Hệ thống: Trung tâm Kiểm soát Bệnh tật Đà Nẵng (ksbtdanang.vn)
# ============================================================

set -e

DATE=$(date +"%Y-%m-%d_%H-%M")
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')]"
BACKUP_DIR="/opt/backups/webcq"
RETAIN_LOCAL_DAYS=7
RETAIN_GDRIVE_DAYS=30

PG_CONTAINER="phobpqxz5kb8uuv7zfv4nqsb"
DB_NAME="postgres"
DB_USER="postgres"
MEDIA_DIR="/var/lib/docker/volumes/4tvv3sasw7sgzyk1xuwljp1f-media-storage/_data"
GDRIVE_REMOTE="gdrive:CDC_BACKUP"

echo "=========================================================="
echo "$LOG_PREFIX Bắt đầu tiến trình backup hệ thống..."
echo "=========================================================="

mkdir -p "$BACKUP_DIR/db"
mkdir -p "$BACKUP_DIR/logs"

# 1. BACKUP DATABASE (PostgreSQL)
echo "$LOG_PREFIX 1. Đang sao lưu PostgreSQL database..."
DUMP_FILE="$BACKUP_DIR/db/db_$DATE.dump"

docker exec "$PG_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" -F c > "$DUMP_FILE"

DB_SIZE=$(du -sh "$DUMP_FILE" | cut -f1)
echo "$LOG_PREFIX    -> Database OK: $DUMP_FILE ($DB_SIZE)"

# 2. KIỂM TRA KẾT NỐI GOOGLE DRIVE QUA RCLONE
if rclone listremotes | grep -q "^gdrive:"; then
    echo "$LOG_PREFIX 2. Đồng bộ CSDL và Media lên Google Drive..."

    # Đẩy file CSDL lên Google Drive (thư mục CDC_BACKUP/db)
    echo "$LOG_PREFIX    -> Đang tải CSDL lên Google Drive ($GDRIVE_REMOTE/db)..."
    rclone copy "$DUMP_FILE" "$GDRIVE_REMOTE/db/" --fast-list

    # Đồng bộ Media lên Google Drive (thư mục CDC_BACKUP/media)
    # rclone sync chỉ tải các file mới hoặc đã thay đổi, tiết kiệm tối đa băng thông
    if [ -d "$MEDIA_DIR" ]; then
        echo "$LOG_PREFIX    -> Đang đồng bộ Media lên Google Drive ($GDRIVE_REMOTE/media)..."
        rclone sync "$MEDIA_DIR" "$GDRIVE_REMOTE/media/" \
            --fast-list \
            --transfers 4 \
            --checkers 8 \
            --drive-chunk-size 64M \
            --stats 30s \
            --stats-one-line
        echo "$LOG_PREFIX    -> Đồng bộ Media hoàn tất!"
    else
        echo "$LOG_PREFIX    -> ⚠️ Không tìm thấy thư mục media: $MEDIA_DIR"
    fi

    # Dọn dẹp bản backup CSDL cũ hơn 30 ngày trên Google Drive
    echo "$LOG_PREFIX    -> Dọn dẹp CSDL cũ hơn $RETAIN_GDRIVE_DAYS ngày trên Google Drive..."
    rclone delete --min-age "${RETAIN_GDRIVE_DAYS}d" "$GDRIVE_REMOTE/db/" || true
else
    echo "$LOG_PREFIX 2. ⚠️ Chưa cấu hình remote 'gdrive:' trong rclone."
    echo "$LOG_PREFIX    -> Tạm thời lưu bản backup CSDL tại cục bộ VPS."
fi

# 3. DỌN DẸP DUNG LƯỢNG CỤC BỘ TRÊN VPS
echo "$LOG_PREFIX 3. Dọn dẹp bản backup CSDL cục bộ cũ hơn $RETAIN_LOCAL_DAYS ngày..."
find "$BACKUP_DIR/db" -type f -name "db_*.dump" -mtime +"$RETAIN_LOCAL_DAYS" -delete
echo "$LOG_PREFIX    -> Đã dọn dẹp dung lượng đĩa cục bộ."

echo "=========================================================="
echo "$LOG_PREFIX Hoàn tất backup thành công!"
echo "Dung lượng thư mục backup local: $(du -sh $BACKUP_DIR | cut -f1)"
echo "Ổ cứng VPS còn trống: $(df -h / | awk 'NR==2 {print $4}')"
echo "=========================================================="
