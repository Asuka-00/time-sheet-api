import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { RolePermission } from '../roles/entities/role-permission.entity';
import * as argon2 from 'argon2';

@Injectable()
export class DatabaseSeederService {
    private readonly logger = new Logger(DatabaseSeederService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(RolePermission)
        private readonly rolePermissionRepository: Repository<RolePermission>,
    ) {}

    /**
     * 执行数据库种子数据初始化
     */
    async seed(): Promise<void> {
        try {
            this.logger.log('Starting database seeding...');

            // 1. 插入权限数据
            await this.seedPermissions();

            // 2. 创建管理员角色并分配权限
            await this.seedDefaultRole();

            // 3. 创建管理员用户
            await this.seedDefaultAdmin();

            this.logger.log('Database seeding completed successfully');
        } catch (error) {
            this.logger.error('Database seeding failed:', error);
            // 不中断应用启动，仅记录错误
        }
    }

    /**
     * 插入默认权限数据
     */
    private async seedPermissions(): Promise<void> {
        try {
            // 检查权限表是否为空
            const count = await this.permissionRepository.count();
            if (count > 0) {
                this.logger.log('Permissions already exist, skipping permission seeding');
                return;
            }

            this.logger.log('Seeding permissions...');

            // 权限数据
            const permissions: Partial<Permission>[] = [
                {
                    uuid: 'd7b5a8c3237c9d2c216e0be51e5ce14e',
                    name: 'System Management',
                    menuName: 'systemManagement',
                    code: 'system',
                    module: 'system',
                    parentCode: undefined,
                    type: 'menu',
                    path: undefined,
                    icon: 'settings',
                    component: undefined,
                    sort: 0,
                    description: 'System management parent menu',
                    status: 1,
                    createdBy: 'system',
                    createdAt: new Date('2025-10-01 12:01:50'),
                    updatedBy: 'admin',
                    updatedAt: new Date('2025-10-01 12:29:42.886'),
                },
                {
                    uuid: '79dfd1169a7095571dd543155c49f151',
                    name: 'User Management',
                    menuName: 'userManagement',
                    code: 'system:user',
                    module: 'system',
                    parentCode: 'system',
                    type: 'menu',
                    path: '/user',
                    icon: 'person',
                    component: 'pages/user/UserManagement.vue',
                    sort: 0,
                    description:
                        'User management module for creating, updating, and managing users',
                    status: 1,
                    createdBy: 'system',
                    createdAt: new Date('2025-10-01 12:01:50'),
                    updatedBy: 'admin',
                    updatedAt: new Date('2025-10-01 12:30:00.950'),
                },
                {
                    uuid: 'abf0ad606c82e1777035f1dc59f42f6c',
                    name: 'Permission Management',
                    menuName: 'permissionManagement',
                    code: 'system:permission',
                    module: 'system',
                    parentCode: 'system',
                    type: 'menu',
                    path: '/permission',
                    icon: 'lock',
                    component: 'pages/permission/PermissionManagement.vue',
                    sort: 1,
                    description:
                        'Permission management module for creating, updating, and managing system permissions',
                    status: 1,
                    createdBy: 'system',
                    createdAt: new Date('2025-10-01 12:01:50'),
                    updatedBy: 'admin',
                    updatedAt: new Date('2025-10-01 12:30:22.035'),
                },
                {
                    uuid: '9e46ddd8-ca60-4c9b-b61d-94ac9b5df97c',
                    name: 'Role Management',
                    menuName: 'roleManagement',
                    code: 'system:role',
                    module: 'system',
                    parentCode: 'system',
                    type: 'menu',
                    path: '/role',
                    icon: 'group',
                    component: 'pages/role/RoleManagement.vue',
                    sort: 2,
                    description: 'Role management Mouduel',
                    status: 1,
                    createdBy: 'admin',
                    createdAt: new Date('2025-10-01 14:19:49'),
                    updatedBy: undefined,
                    updatedAt: undefined,
                },
                {
                    uuid: 'e34bb979-07b9-46a0-9b48-c6e6df6d0d8c',
                    name: 'Project Management',
                    menuName: 'projectManagement',
                    code: 'project',
                    module: 'project',
                    parentCode: undefined,
                    type: 'menu',
                    path: undefined,
                    icon: 'view_list',
                    component: undefined,
                    sort: 1,
                    description: 'Project management parent menu',
                    status: 1,
                    createdBy: 'admin',
                    createdAt: new Date('2025-10-01 15:30:10'),
                    updatedBy: 'admin',
                    updatedAt: new Date('2025-10-01 15:31:08.466'),
                },
                {
                    uuid: '07c5738b-f21b-4d99-aa66-47548eb66264',
                    name: 'Project Management',
                    menuName: 'projectManagement',
                    code: 'project:project',
                    module: 'project',
                    parentCode: 'project',
                    type: 'menu',
                    path: '/project',
                    icon: 'work',
                    component: 'pages/project/ProjectManagement.vue',
                    sort: 0,
                    description: 'Project Management View',
                    status: 1,
                    createdBy: 'admin',
                    createdAt: new Date('2025-10-01 15:33:12'),
                    updatedBy: undefined,
                    updatedAt: undefined,
                },
                {
                    uuid: 'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6',
                    name: 'Timesheet Management',
                    menuName: 'timesheetManagement',
                    code: 'timesheet',
                    module: 'timesheet',
                    parentCode: undefined,
                    type: 'menu',
                    path: undefined,
                    icon: 'schedule',
                    component: undefined,
                    sort: 2,
                    description: 'Timesheet management parent menu',
                    status: 1,
                    createdBy: 'admin',
                    createdAt: new Date('2025-10-02 16:20:38'),
                    updatedBy: undefined,
                    updatedAt: undefined,
                },
                {
                    uuid: 'b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7',
                    name: 'My Timesheets',
                    menuName: 'myTimesheets',
                    code: 'timesheet:my-timesheets',
                    module: 'timesheet',
                    parentCode: 'timesheet',
                    type: 'menu',
                    path: '/timesheet/my-timesheets',
                    icon: 'access_time',
                    component: 'pages/timesheet/MyTimesheetPage.vue',
                    sort: 0,
                    description: 'My timesheets view for creating and managing personal work hours',
                    status: 1,
                    createdBy: 'admin',
                    createdAt: new Date('2025-10-02 16:20:38'),
                    updatedBy: undefined,
                    updatedAt: undefined,
                },
                {
                    uuid: 'c3d4e5f6-a7b8-49c0-d1e2-f3a4b5c6d7e8',
                    name: 'Timesheet Review',
                    menuName: 'timesheetReview',
                    code: 'timesheet:review',
                    module: 'timesheet',
                    parentCode: 'timesheet',
                    type: 'menu',
                    path: '/timesheet/review',
                    icon: 'rate_review',
                    component: 'pages/timesheet/TimesheetReviewPage.vue',
                    sort: 1,
                    description:
                        'Timesheet review view for project managers to approve or reject timesheets',
                    status: 1,
                    createdBy: 'admin',
                    createdAt: new Date('2025-10-02 16:20:38'),
                    updatedBy: undefined,
                    updatedAt: undefined,
                },
                {
                    uuid: 'd4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9',
                    name: 'Timesheet Statistics',
                    menuName: 'timesheetStatistics',
                    code: 'timesheet:statistics',
                    module: 'timesheet',
                    parentCode: 'timesheet',
                    type: 'menu',
                    path: '/timesheet/statistics',
                    icon: 'insights',
                    component: 'pages/timesheet/TimesheetStatisticsPage.vue',
                    sort: 3,
                    description:
                        'Timesheet statistics view for viewing work hours analytics and reports',
                    status: 1,
                    createdBy: 'admin',
                    createdAt: new Date('2025-10-02 16:20:38'),
                    updatedBy: undefined,
                    updatedAt: undefined,
                },
                {
                    uuid: 'e5f6a7b8-c9d0-41e2-f3a4-b5c6d7e8f9a0',
                    name: 'Project Manager Timesheets',
                    menuName: 'projectManagerTimesheets',
                    code: 'timesheet:project-manager-timesheets',
                    module: 'timesheet',
                    parentCode: 'timesheet',
                    type: 'menu',
                    path: '/timesheet/project-manager-timesheets',
                    icon: 'folder_shared',
                    component: 'pages/timesheet/ProjectManagerTimesheetsPage.vue',
                    sort: 2,
                    description:
                        'Project manager timesheets view for viewing and managing all timesheets in managed projects',
                    status: 1,
                    createdBy: 'admin',
                    createdAt: new Date('2025-10-02 16:20:38'),
                    updatedBy: undefined,
                    updatedAt: undefined,
                },
                {
                    uuid: 'f5a6b7c8-d9e0-42f1-a3b4-c5d6e7f8a9b0',
                    name: 'Department Management',
                    menuName: 'departmentManagement',
                    code: 'system:department',
                    module: 'system',
                    parentCode: 'system',
                    type: 'menu',
                    path: '/department',
                    icon: 'corporate_fare',
                    component: 'pages/department/DepartmentManagement.vue',
                    sort: 3,
                    description:
                        'Department management module for creating, updating, and managing organizational departments',
                    status: 1,
                    createdBy: 'admin',
                    createdAt: new Date('2025-10-06 10:00:00'),
                    updatedBy: undefined,
                    updatedAt: undefined,
                },
                {
                    uuid: 'a6b7c8d9-e0f1-43a2-b4c5-d6e7f8a9b0c1',
                    name: 'Report Configuration Management',
                    menuName: 'reportConfigManagement',
                    code: 'system:report-config',
                    module: 'system',
                    parentCode: 'system',
                    type: 'menu',
                    path: '/report-config',
                    icon: 'assessment',
                    component: 'pages/report-config/ReportConfigManagement.vue',
                    sort: 4,
                    description:
                        'Report configuration management module for creating and managing scheduled report delivery',
                    status: 1,
                    createdBy: 'admin',
                    createdAt: new Date('2025-10-10 16:45:00'),
                    updatedBy: undefined,
                    updatedAt: undefined,
                },
            ];

            await this.permissionRepository.save(permissions);
            this.logger.log(`Successfully seeded ${permissions.length} permissions`);
        } catch (error) {
            this.logger.error('Failed to seed permissions:', error);
            throw error;
        }
    }

    /**
     * 创建默认管理员角色并分配所有权限
     */
    private async seedDefaultRole(): Promise<void> {
        try {
            // 检查管理员角色是否存在
            const existingRole = await this.roleRepository.findOne({
                where: { name: 'Administrator' },
            });

            if (existingRole) {
                this.logger.log('Administrator role already exists, skipping role seeding');
                return;
            }

            this.logger.log('Seeding Administrator role...');

            // 创建管理员角色
            const adminRole = this.roleRepository.create({
                name: 'Administrator',
                description: 'System administrator with full permissions',
                createdBy: 'system',
            });
            await this.roleRepository.save(adminRole);

            // 获取所有权限代码
            const allPermissions = await this.permissionRepository.find();
            const permissionCodes = allPermissions.map((p) => p.code);

            // 为管理员角色分配所有权限
            const rolePermissions = permissionCodes.map((code) =>
                this.rolePermissionRepository.create({
                    roleName: 'Administrator',
                    permissionCode: code,
                    createdBy: 'system',
                }),
            );

            await this.rolePermissionRepository.save(rolePermissions);
            this.logger.log(
                `Successfully created Administrator role with ${permissionCodes.length} permissions`,
            );
        } catch (error) {
            this.logger.error('Failed to seed Administrator role:', error);
            throw error;
        }
    }

    /**
     * 创建默认管理员账户
     */
    private async seedDefaultAdmin(): Promise<void> {
        try {
            // 检查管理员账户是否存在
            const existingAdmin = await this.userRepository.findOne({
                where: { userCode: 'admin' },
            });

            if (existingAdmin) {
                this.logger.log('Administrator user already exists, skipping user seeding');
                return;
            }

            this.logger.log('Seeding Administrator user...');

            // 加密默认密码
            const hashedPassword = await argon2.hash('Admin@123');

            // 创建管理员用户
            const adminUser = this.userRepository.create({
                userCode: 'admin',
                userName: 'Administrator',
                password: hashedPassword,
                email: 'admin@timesheet.com',
                phoneNumber: undefined,
                roleName: 'Administrator',
                departmentName: undefined,
                timezone: 'UTC',
                status: 1,
                createdBy: 'system',
            });

            await this.userRepository.save(adminUser);
            this.logger.log(
                'Successfully created Administrator user (userCode: admin, password: Admin@123)',
            );
        } catch (error) {
            this.logger.error('Failed to seed Administrator user:', error);
            throw error;
        }
    }
}
