import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { RequestContextService } from '../context/request-context.service';

/**
 * 审计字段订阅者
 * 自动填充实体的createdBy、updatedBy、updatedAt字段
 */
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
    /**
     * 监听所有实体
     */

    /**
     * 插入前自动设置createdBy
     */
    beforeInsert(event: InsertEvent<any>) {
        const userCode = RequestContextService.getCurrentUserCode();
        if (userCode && event.entity) {
            event.entity.createdBy = userCode;
        }
    }

    /**
     * 更新前自动设置updatedBy和updatedAt
     */
    beforeUpdate(event: UpdateEvent<any>) {
        const userCode = RequestContextService.getCurrentUserCode();
        if (userCode && event.entity) {
            event.entity.updatedBy = userCode;
            // SQLite使用TEXT存储datetime，设置为ISO字符串
            event.entity.updatedAt = new Date();
        }
    }
}
