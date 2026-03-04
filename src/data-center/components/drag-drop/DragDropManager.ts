/**
 * @file DragDropManager.ts
 * @description 拖拽设计器核心拖拽管理器
 * @version 1.0.0
 * @author DataCenter Team
 * @date 2026-02-28
 */

import {
  WidgetConfig,
  Position,
  Size,
  DraggableItem,
  DropTarget,
  DragState,
  WidgetType,
} from '../../models/report-models';

// 拖拽事件处理?export interface DragDropHandlers {
  onDragStart?: (item: DraggableItem, event: React.DragEvent) => void;
  onDragOver?: (target: DropTarget, event: React.DragEvent) => void;
  onDragLeave?: (target: DropTarget, event: React.DragEvent) => void;
  onDrop?: (target: DropTarget, event: React.DragEvent) => void;
  onDragEnd?: (event: React.DragEvent) => void;
}

/**
 * 拖拽管理器主? */
export class DragDropManager {
  private dragState: DragState | null = null;
  private handlers: DragDropHandlers = {};
  private dropTargets: Map<string, DropTarget> = new Map();

  constructor(handlers: DragDropHandlers = {}) {
    this.handlers = handlers;
    this.setupGlobalListeners();
  }

  /**
   * 设置全局事件监听?   */
  private setupGlobalListeners() {
    // 全局拖拽结束监听
    document.addEventListener('dragend', this.handleGlobalDragEnd);
    document.addEventListener('drop', this.handleGlobalDrop);
  }

  /**
   * 注册放置目标
   */
  registerDropTarget(
    id: string,
    element: HTMLElement,
    type: DropTarget['type']
  ): void {
    const rect = element.getBoundingClientRect();
    const target: DropTarget = {
      type,
      id,
      element,
      rect,
    };
    this.dropTargets.set(id, target);
  }

  /**
   * 移除放置目标
   */
  unregisterDropTarget(id: string): void {
    this.dropTargets.delete(id);
  }

  /**
   * 开始拖?   */
  startDrag(item: DraggableItem, event: React.DragEvent): void {
    // 防止默认行为
    event.preventDefault();

    this.dragState = {
      item,
      startPosition: { x: event.clientX, y: event.clientY },
      currentPosition: { x: event.clientX, y: event.clientY },
      currentTarget: null,
    };

    // 设置拖拽数据
    event.dataTransfer.setData('application/json', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'copyMove';

    // 触发回调
    this.handlers.onDragStart?.(item, event);
  }

  /**
   * 处理拖拽经过
   */
  handleDragOver(target: DropTarget, event: React.DragEvent): void {
    event.preventDefault();

    if (!this.dragState) return;

    // 更新当前位置
    this.dragState.currentPosition = { x: event.clientX, y: event.clientY };
    this.dragState.currentTarget = target;

    // 设置放置效果
    event.dataTransfer.dropEffect = this.getDropEffect(target);

    // 触发回调
    this.handlers.onDragOver?.(target, event);
  }

  /**
   * 处理拖拽离开
   */
  handleDragLeave(target: DropTarget, event: React.DragEvent): void {
    event.preventDefault();

    if (!this.dragState) return;

    // 检查是否真的离开了目标元?    const relatedTarget = event.relatedTarget as HTMLElement;
    if (relatedTarget && target.element.contains(relatedTarget)) {
      return;
    }

    // 清除当前目标
    if (this.dragState?.id === target.id) {
      this.dragState.currentTarget = null;
    }

    // 触发回调
    this.handlers.onDragLeave?.(target, event);
  }

  /**
   * 处理放置操作
   */
  handleDrop(target: DropTarget, event: React.DragEvent): void {
    event.preventDefault();

    if (!this.dragState) return;

    try {
      // 获取拖拽数据
      const dragData = event.dataTransfer.getData('application/json');
      if (!dragData) return;

      const draggedItem: DraggableItem = JSON.parse(dragData);

      // 触发放置回调
      this.handlers.onDrop?.(target, event);
    } catch (error) {
      console.error('拖拽数据解析失败:', error);
    } finally {
      this.cleanup();
    }
  }

  /**
   * 全局拖拽结束处理
   */
  private handleGlobalDragEnd = (event: DragEvent): void => {
    this.cleanup();
    this.handlers.onDragEnd?.(event as any);
  };

  /**
   * 全局放置处理
   */
  private handleGlobalDrop = (event: DragEvent): void => {
    // 如果没有在已知目标上放置，则清理状?    if (this.dragState && !this.dragState.currentTarget) {
      this.cleanup();
    }
  };

  /**
   * 获取放置效果
   */
  private getDropEffect(target: DropTarget): 'copy' | 'move' | 'none' {
    if (!this.dragState) return 'none';

    // 根据目标类型决定放置效果
    switch (target.type) {
      case 'canvas':
        return 'copy'; // 在画布上复制组件
      case 'widget':
        return 'move'; // 在组件间移动
      case 'panel':
        return 'copy'; // 在面板间复制
      default:
        return 'none';
    }
  }

  /**
   * 计算相对于目标元素的位置
   */
  calculateRelativePosition(
    target: DropTarget,
    clientX: number,
    clientY: number
  ): Position {
    const rect = target.rect;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  /**
   * 获取最近的放置目标
   */
  getNearestDropTarget(x: number, y: number): DropTarget | null {
    let nearestTarget: DropTarget | null = null;
    let minDistance = Infinity;

    this.dropTargets.forEach(target => {
      const rect = target.rect;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );

      if (distance < minDistance && distance < 100) {
        // 100px范围内的最近目?        minDistance = distance;
        nearestTarget = target;
      }
    });

    return nearestTarget;
  }

  /**
   * 检查点是否在目标内
   */
  isPointInTarget(target: DropTarget, x: number, y: number): boolean {
    const rect = target.rect;
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  }

  /**
   * 获取当前拖拽状?   */
  getDragState(): DragState | null {
    return this.dragState;
  }

  /**
   * 清理拖拽状?   */
  private cleanup(): void {
    this.dragState = null;
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    document.removeEventListener('dragend', this.handleGlobalDragEnd);
    document.removeEventListener('drop', this.handleGlobalDrop);
    this.dropTargets.clear();
    this.cleanup();
  }
}

// React Hook封装
export const useDragDropManager = (handlers: DragDropHandlers = {}) => {
  return new DragDropManager(handlers);
};

// 默认拖拽项目工厂
export const createDraggableWidget = (
  widgetType: WidgetType,
  subtype?: string
): DraggableItem => ({
  type: 'widget',
  widgetType,
  subtype,
  data: {},
});

export const createDraggableField = (
  fieldName: string,
  fieldType: string
): DraggableItem => ({
  type: 'field',
  subtype: fieldType,
  data: { fieldName },
});

export const createDraggableDatasource = (
  sourceId: string,
  sourceName: string
): DraggableItem => ({
  type: 'datasource',
  data: { sourceId, sourceName },
});
