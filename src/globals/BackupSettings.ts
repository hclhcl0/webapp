import type { GlobalConfig } from 'payload';
import { getUserRole } from '../lib/rbac.ts';

const isAdminOnly = ({ req: { user } }: any) => getUserRole(user) === 'admin';

export const BackupSettings: GlobalConfig = {
  slug: 'backup-settings',
  label: 'Sao lưu & Khôi phục',
  admin: {
    group: 'Quản trị hệ thống',
    description: 'Quản lý sao lưu CSDL PostgreSQL, đồng bộ Media lên Google Drive và lịch chạy tự động.',
  },
  access: {
    read: isAdminOnly,
    update: isAdminOnly,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Bảng điều khiển Sao lưu',
          fields: [
            {
              name: 'backupDashboard',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/Admin/BackupDashboard.tsx#BackupDashboard',
                },
              },
            },
          ],
        },
        {
          label: 'Cấu hình Google Drive',
          fields: [
            {
              name: 'authMethod',
              type: 'select',
              label: 'Phương thức kết nối Google Drive',
              defaultValue: 'oauth2',
              options: [
                {
                  label: 'Tài khoản Google cá nhân / Cơ quan (OAuth 2.0 — Khuyên dùng)',
                  value: 'oauth2',
                },
                {
                  label: 'Google Workspace Shared Drive (Service Account JSON)',
                  value: 'service_account',
                },
              ],
            },
            {
              name: 'oauthGuide',
              type: 'ui',
              admin: {
                condition: (data: any) => (data?.authMethod || 'oauth2') === 'oauth2',
                components: {
                  Field: '@/components/Admin/OAuthGuideField.tsx#OAuthGuideField',
                },
              },
            },
            {
              type: 'row',
              admin: {
                condition: (data: any) => (data?.authMethod || 'oauth2') === 'oauth2',
              },
              fields: [
                {
                  name: 'oauthClientId',
                  type: 'text',
                  label: 'Google OAuth Client ID',
                  admin: {
                    width: '50%',
                    description: 'Dán Client ID lấy từ Google Cloud Console.',
                  },
                },
                {
                  name: 'oauthClientSecret',
                  type: 'text',
                  label: 'Google OAuth Client Secret',
                  admin: {
                    width: '50%',
                    description: 'Dán Client Secret tương ứng (chỉ Quản trị viên xem được).',
                  },
                },
              ],
            },
            {
              name: 'oauthEmail',
              type: 'text',
              label: 'Tài khoản Google đang liên kết',
              admin: {
                readOnly: true,
                condition: (data: any) => (data?.authMethod || 'oauth2') === 'oauth2',
                description: 'Tự động cập nhật sau khi bấm "Lưu & Kết nối Google Drive".',
              },
            },
            {
              name: 'oauthRefreshToken',
              type: 'text',
              label: 'OAuth Refresh Token',
              admin: {
                hidden: true,
              },
            },
            {
              name: 'oauthAccessToken',
              type: 'text',
              label: 'OAuth Access Token',
              admin: {
                hidden: true,
              },
            },
            {
              name: 'oauthTokenExpiry',
              type: 'text',
              label: 'OAuth Token Expiry',
              admin: {
                hidden: true,
              },
            },
            {
              name: 'serviceAccountUpload',
              type: 'ui',
              admin: {
                condition: (data: any) => data?.authMethod === 'service_account',
                components: {
                  Field: '@/components/Admin/ServiceAccountUploadField.tsx#ServiceAccountUploadField',
                },
              },
            },
            {
              name: 'serviceAccountJson',
              type: 'textarea',
              label: 'Nội dung Service Account JSON',
              admin: {
                condition: (data: any) => data?.authMethod === 'service_account',
                description: 'Tự động điền khi chọn file .json ở trên hoặc dán trực tiếp nội dung file.',
              },
            },
            {
              name: 'driveFolderInput',
              type: 'text',
              label: 'Link hoặc ID thư mục Google Drive đích (Tùy chọn)',
              admin: {
                description:
                  'Dán link thư mục Google Drive (VD: https://drive.google.com/drive/folders/1abc...) hoặc để trống để hệ thống tự tạo thư mục "CDC_BACKUP" ở gốc Drive.',
              },
            },
            {
              name: 'driveConnectActions',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/Admin/DriveConnectActionsField.tsx#DriveConnectActionsField',
                },
              },
            },
          ],
        },
        {
          label: 'Lịch tự động & Lưu trữ',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'autoBackupEnabled',
                  type: 'checkbox',
                  label: 'Bật sao lưu tự động hàng ngày',
                  defaultValue: true,
                },
                {
                  name: 'backupIncludeMedia',
                  type: 'checkbox',
                  label: 'Đồng bộ cả Media lên Google Drive khi chạy tự động',
                  defaultValue: true,
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'backupHour',
                  type: 'number',
                  label: 'Giờ chạy tự động hàng ngày (Giờ Việt Nam 0–23)',
                  defaultValue: 2,
                  min: 0,
                  max: 23,
                  admin: {
                    description: 'Mặc định: 2 (tức 02:00 sáng theo giờ Việt Nam).',
                  },
                },
                {
                  name: 'retainLocalDays',
                  type: 'number',
                  label: 'Số ngày giữ bản sao lưu CSDL trên VPS',
                  defaultValue: 7,
                  min: 1,
                  max: 365,
                  admin: {
                    description: 'Tự động xóa các file .sql.gz cũ hơn số ngày này để tránh đầy đĩa VPS.',
                  },
                },
                {
                  name: 'retainDriveCount',
                  type: 'number',
                  label: 'Số bản CSDL tối đa giữ trên Google Drive',
                  defaultValue: 30,
                  min: 1,
                  max: 365,
                  admin: {
                    description: 'Giữ tối đa N bản CSDL gần nhất trong thư mục db/ trên Google Drive.',
                  },
                },
              ],
            },
            {
              name: 'lastBackupAt',
              type: 'text',
              label: 'Thời gian chạy gần nhất',
              admin: { readOnly: true },
            },
            {
              name: 'lastBackupStatus',
              type: 'text',
              label: 'Trạng thái lần chạy gần nhất',
              admin: { readOnly: true },
            },
            {
              name: 'lastBackupSummary',
              type: 'textarea',
              label: 'Tóm tắt kết quả gần nhất',
              admin: { readOnly: true },
            },
          ],
        },
      ],
    },
  ],
};
