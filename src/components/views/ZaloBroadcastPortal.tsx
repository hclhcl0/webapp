/**
 * ZaloBroadcastPortal — wrapper cho Portal Frontend.
 * Tái sử dụng toàn bộ logic từ ZaloBroadcastView (gọi cùng các API /api/zalo-admin/*).
 * Chỉ bỏ phần wrapper Payload Admin (DefaultEditView) để dùng được trong Portal.
 */
export { default } from './ZaloBroadcastView';
