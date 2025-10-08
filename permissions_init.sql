-- ============================================================================
-- Permission Initialization SQL for TimeSheet System
-- Database: SQLite
-- Purpose: Insert initial permissions for System Management module
-- ============================================================================

-- 1. Parent Menu: System Management
INSERT INTO "permission" (
    "uuid",
    "name",
    "menuName",
    "code",
    "module",
    "parentCode",
    "type",
    "path",
    "icon",
    "component",
    "sort",
    "description",
    "status",
    "createdBy",
    "createdAt"
) VALUES (
    lower(hex(randomblob(16))),
    'System Management',
    '系统管理',
    'system',
    'system',
    NULL,
    'menu',
    NULL,
    'settings',
    NULL,
    0,
    'System management parent menu',
    1,
    'system',
    CURRENT_TIMESTAMP
);

-- 2. User Management (Child of System Management)
INSERT INTO "permission" (
    "uuid",
    "name",
    "menuName",
    "code",
    "module",
    "parentCode",
    "type",
    "path",
    "icon",
    "component",
    "sort",
    "description",
    "status",
    "createdBy",
    "createdAt"
) VALUES (
    lower(hex(randomblob(16))),
    'User Management',
    '用户管理',
    'system:user',
    'system',
    'system',
    'menu',
    '/user',
    'people',
    'pages/user/UserManagement.vue',
    0,
    'User management module for creating, updating, and managing users',
    1,
    'system',
    CURRENT_TIMESTAMP
);

-- 3. Permission Management (Child of System Management)
INSERT INTO "permission" (
    "uuid",
    "name",
    "menuName",
    "code",
    "module",
    "parentCode",
    "type",
    "path",
    "icon",
    "component",
    "sort",
    "description",
    "status",
    "createdBy",
    "createdAt"
) VALUES (
    lower(hex(randomblob(16))),
    'Permission Management',
    '权限管理',
    'system:permission',
    'system',
    'system',
    'menu',
    '/permission',
    'lock',
    'pages/permission/PermissionManagement.vue',
    1,
    'Permission management module for creating, updating, and managing system permissions',
    1,
    'system',
    CURRENT_TIMESTAMP
);

-- ============================================================================
-- End of Permission Initialization SQL
-- ============================================================================
