import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { Department } from './entities/department.entity';
import { DepartmentDto } from './dto/department.dto';
import { DepartmentVo } from './dto/department.vo';
import { BusinessException, ERROR_CODES } from '../../common';

@Injectable()
export class DepartmentService {
    constructor(
        @InjectRepository(Department)
        private readonly departmentRepository: Repository<Department>,
    ) {}

    /**
     * 新增部门
     * @param departmentDto
     */
    @Transactional()
    async createDepartment(departmentDto: DepartmentDto): Promise<void> {
        const duplicateDepartment = await this.departmentRepository.findOneBy({
            name: departmentDto.name,
        });
        if (duplicateDepartment) {
            throw new BusinessException(ERROR_CODES.DEPARTMENT.CREATE.ALREADY_EXISTS, 400);
        }

        // 如果有上级部门，验证上级部门是否存在
        if (departmentDto.parentDepartmentName) {
            const parentDepartment = await this.departmentRepository.findOneBy({
                name: departmentDto.parentDepartmentName,
            });
            if (!parentDepartment) {
                throw new BusinessException(ERROR_CODES.DEPARTMENT.CREATE.PARENT_NOT_FOUND, 404);
            }
        }

        const department = this.departmentRepository.create(departmentDto);
        await this.departmentRepository.save(department);
    }

    /**
     * 分页查询部门列表
     * @param current 当前页
     * @param size 每页大小
     * @param searchKey 搜索关键字
     * @returns 分页部门列表
     */
    async getDepartmentList(
        current: number,
        size: number,
        searchKey?: string,
    ): Promise<{ records: DepartmentVo[]; total: number }> {
        // 构建查询条件
        let where: FindOptionsWhere<Department> | FindOptionsWhere<Department>[] = {};
        if (searchKey) {
            // 支持按部门名称、描述模糊搜索
            where = [{ name: Like(`%${searchKey}%`) }, { description: Like(`%${searchKey}%`) }];
        }

        const [records, total] = await this.departmentRepository.findAndCount({
            where,
            take: size,
            skip: (current - 1) * size,
            order: {
                createdAt: 'DESC', // 按创建时间倒序
            },
        });
        return { records, total };
    }

    /**
     * 删除部门
     * @param uuid 部门ID
     */
    @Transactional()
    async deleteDepartment(uuid: string): Promise<void> {
        await this.departmentRepository.delete(uuid);
    }

    /**
     * 更新部门
     * @param departmentDto 部门信息
     */
    @Transactional()
    async updateDepartment(departmentDto: DepartmentDto): Promise<void> {
        if (!departmentDto.uuid) {
            throw new BusinessException(ERROR_CODES.DEPARTMENT.COMMON.ID_REQUIRED, 400);
        }

        // 如果有上级部门，验证上级部门是否存在
        if (departmentDto.parentDepartmentName) {
            const parentDepartment = await this.departmentRepository.findOneBy({
                name: departmentDto.parentDepartmentName,
            });
            if (!parentDepartment) {
                throw new BusinessException(ERROR_CODES.DEPARTMENT.CREATE.PARENT_NOT_FOUND, 404);
            }
        }

        await this.departmentRepository.update(departmentDto.uuid, departmentDto);
    }

    /**
     * 查询部门
     * @param uuid 部门ID
     * @returns 部门信息
     */
    async getDepartment(uuid?: string): Promise<DepartmentVo[]> {
        const department = await this.departmentRepository.find({ where: { uuid } });
        if (!department) {
            throw new BusinessException(ERROR_CODES.DEPARTMENT.COMMON.NOT_FOUND, 404);
        }
        return department;
    }
}
