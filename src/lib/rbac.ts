import type { CollectionConfig, GlobalConfig } from 'payload';

/**
 * Bản đồ liên kết giữa Module lựa chọn trong User với các Collection slug tương ứng
 */
export const MODULE_COLLECTION_MAP: Record<string, string[]> = {
  'articles': ['articles'],
  'videos': ['videos', 'video-channels', 'video-warning-settings'],
  'vaccines': ['vaccines', 'vaccine-packages'],
  'ai-knowledge': ['ai-knowledge'],
  'banners': ['banners', 'banner-settings'],
  'documents': ['documents', 'document-signers'],
  'procurements': ['procurements'],
  'pages': ['pages'],
  'org-units': ['org-units'],
  'form-submissions': ['form-submissions'],
  'media': ['media', 'media-folders'],
  'categories': ['categories', 'tags'],
};

/**
 * Lấy role chuẩn hóa của user (string lowercase)
 */
export function getUserRole(user: any): string | null {
  if (!user) return null;
  const role = Array.isArray(user.role) ? user.role[0] : user.role;
  return typeof role === 'string' ? role.toLowerCase() : null;
}

/**
 * Lấy danh sách module được phân công của user
 * Trả về mảng string nếu có, hoặc null nếu không giới hạn (để trống).
 */
export function getUserAllowedModules(user: any): string[] | null {
  if (!user) return null;
  const mods = user.allowedModules;
  if (!Array.isArray(mods) || mods.length === 0) return null;
  return mods.filter(Boolean);
}

/**
 * Kiểm tra xem 1 collection/slug cụ thể có nằm trong phạm vi allowedModules của user không
 */
export function isCollectionInAllowedModules(allowedModules: string[], colSlug: string): boolean {
  for (const mod of allowedModules) {
    if (mod === colSlug) return true;
    const mapped = MODULE_COLLECTION_MAP[mod];
    if (mapped && mapped.includes(colSlug)) return true;
  }
  return false;
}

/**
 * Kiểm tra quyền truy cập thao tác trên module/collection (dùng trong collection access)
 * @param user User payload
 * @param colSlug Tên collection slug hoặc module key
 * @param allowedDefaultRoles Danh sách vai trò mặc định được phép nếu user không bị gán allowedModules
 */
export function canAccessModule(
  user: any,
  colSlug: string,
  allowedDefaultRoles: string[] = ['admin', 'moderator', 'editor']
): boolean {
  const role = getUserRole(user);
  if (!role || role === 'user') return false;
  if (role === 'admin') return true;

  // Kiểm tra role có quyền mặc định không
  const roleHasDefaultAccess = allowedDefaultRoles.includes(role);

  const allowedModules = getUserAllowedModules(user);
  
  // Nếu user có thiết lập danh sách module phân công cụ thể
  if (allowedModules) {
    // Role phải có quyền mặc định VÀ module phải được phân công
    if (!roleHasDefaultAccess) return false;
    return isCollectionInAllowedModules(allowedModules, colSlug);
  }

  // Nếu không phân công module (để trống) → áp dụng theo vai trò mặc định
  return roleHasDefaultAccess;
}


export const withRBAC = (collections: CollectionConfig[]): CollectionConfig[] => {
  return collections.map((col) => {
    // Determine allowed default roles based on collection slug
    let allowedRoles: string[] = ['admin'];
    
    switch (col.slug) {
      case 'articles':
      case 'media':
      case 'media-folders':
        allowedRoles = ['admin', 'moderator', 'editor', 'author'];
        break;
      case 'categories':
      case 'tags':
      case 'documents':
      case 'document-signers':
      case 'departments':
      case 'videos':
      case 'video-channels':
      case 'banners':
      case 'vaccines':
      case 'vaccine-packages':
        allowedRoles = ['admin', 'moderator', 'editor'];
        break;
      case 'pages':
      case 'org-units':
      case 'form-submissions':
      case 'procurements':
      case 'procedures':
      case 'procedure-groups':
      case 'services':
      case 'service-categories':
      case 'ai-knowledge':
        allowedRoles = ['admin', 'moderator'];
        break;
      case 'users':
        allowedRoles = ['admin', 'editor'];
        break;
      case 'api-keys':
      default:
        allowedRoles = ['admin'];
        break;
    }

    const originalHidden = col.admin?.hidden;

    return {
      ...col,
      admin: {
        ...(col.admin || {}),
        hidden: (args: any) => {
          const user = args?.user;
          const userRole = getUserRole(user);
          if (!userRole) return true; // Hide if not logged in
          if (userRole === 'admin') return false; // Admin xem toàn bộ
          
          // Collection 'users': Quyền truy cập theo vai trò (Admin & Editor quản lý CTV), không bị lọc bởi allowedModules
          if (col.slug === 'users') {
            return !['admin', 'editor'].includes(userRole);
          }

          // Collection 'api-keys': Chỉ dành riêng cho Admin
          if (col.slug === 'api-keys') {
            return userRole !== 'admin';
          }

          // If original hidden exists and returns true, respect it
          if (typeof originalHidden === 'function' && originalHidden(args)) return true;
          if (typeof originalHidden === 'boolean' && originalHidden) return true;

          // Trước tiên kiểm tra: Role có quyền mặc định với collection này không?
          const roleHasDefaultAccess = allowedRoles.includes(userRole);

          const allowedModules = getUserAllowedModules(user);

          if (allowedModules) {
            // Nếu có phân công module cụ thể:
            // - Role phải có quyền mặc định VÀ module phải được phân công
            if (!roleHasDefaultAccess) return true; // Role không có quyền mặc định → ẩn
            return !isCollectionInAllowedModules(allowedModules, col.slug);
          }

          // Không phân công module cụ thể -> theo quyền mặc định của vai trò
          return !roleHasDefaultAccess;
        }
      }
    };
  });
};



export const globalsWithRBAC = (globals: GlobalConfig[]): GlobalConfig[] => {
  return globals.map((glb) => {
    let allowedRoles: string[] = ['admin'];
    
    switch (glb.slug) {
      case 'services-landing':
      case 'site-stats':
        allowedRoles = ['admin', 'moderator'];
        break;
      case 'banner-settings':
      case 'video-warning-settings':
        allowedRoles = ['admin', 'moderator', 'editor'];
        break;
      case 'site-settings':
      case 'settings':
      default:
        allowedRoles = ['admin'];
        break;
    }

    const originalHidden = glb.admin?.hidden;

    return {
      ...glb,
      admin: {
        ...(glb.admin || {}),
        hidden: (args: any) => {
          const user = args?.user;
          const userRole = getUserRole(user);
          if (!userRole) return true;
          if (userRole === 'admin') return false;
          
          if (typeof originalHidden === 'function' && originalHidden(args)) return true;
          if (typeof originalHidden === 'boolean' && originalHidden) return true;

          const roleHasDefaultAccess = allowedRoles.includes(userRole);

          const allowedModules = getUserAllowedModules(user);
          if (allowedModules) {
            if (!roleHasDefaultAccess) return true;
            // Với banner-settings và video-warning-settings, map sang module cha
            let targetSlug = glb.slug;
            if (glb.slug === 'banner-settings') targetSlug = 'banners';
            if (glb.slug === 'video-warning-settings') targetSlug = 'videos';
            return !isCollectionInAllowedModules(allowedModules, targetSlug);
          }
          
          return !roleHasDefaultAccess;
        }
      }
    };
  });
};

