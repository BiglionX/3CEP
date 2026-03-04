// 存储管理?- 负责本地数据存储和持久化

export interface StorageConfig {
  storageType: 'localStorage' | 'sessionStorage' | 'indexedDB';
  maxSize: number; // 最大存储大?字节)
  ttl: number; // 数据过期时间(毫秒)
  encryptionEnabled: boolean;
}

export interface StoredEvent {
  id: string;
  data: any;
  timestamp: number;
  expiresAt: number;
}

export class StorageManager {
  private config: StorageConfig;
  private storageKey: string;
  private isIndexedDBReady = false;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = {
      storageType: 'localStorage',
      maxSize: 5 * 1024 * 1024, // 5MB
      ttl: 24 * 60 * 60 * 1000, // 24小时
      encryptionEnabled: false,
      ...config,
    };

    this.storageKey = `tracking_events_${this.config.storageType}`;

    if (this.config.storageType === 'indexedDB') {
      this.initializeIndexedDB();
    }
  }

  // 存储事件
  async storeEvent(event: any): Promise<boolean> {
    try {
      const storedEvent: StoredEvent = {
        id: this.generateId(),
        data: event,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.config.ttl,
      };

      switch (this.config.storageType) {
        case 'localStorage':
          return this.storeInLocalStorage(storedEvent);
        case 'sessionStorage':
          return this.storeInSessionStorage(storedEvent);
        case 'indexedDB':
          return await this.storeInIndexedDB(storedEvent);
        default:
          return false;
      }
    } catch (error) {
      console.error('Failed to store event:', error);
      return false;
    }
  }

  // 获取存储的事?  async getStoredEvents(limit?: number): Promise<StoredEvent[]> {
    try {
      let events: StoredEvent[] = [];

      switch (this.config.storageType) {
        case 'localStorage':
          events = this.getFromLocalStorage();
          break;
        case 'sessionStorage':
          events = this.getFromSessionStorage();
          break;
        case 'indexedDB':
          events = await this.getFromIndexedDB();
          break;
      }

      // 过滤过期事件
      const validEvents = events.filter(event => event.expiresAt > Date.now());

      // 按时间排序，最新的在前
      validEvents.sort((a, b) => b.timestamp - a.timestamp);

      return limit ? validEvents.slice(0, limit) : validEvents;
    } catch (error) {
      console.error('Failed to retrieve events:', error);
      return [];
    }
  }

  // 删除已处理的事件
  async removeEvents(eventIds: string[]): Promise<boolean> {
    try {
      switch (this.config.storageType) {
        case 'localStorage':
          return this.removeFromLocalStorage(eventIds);
        case 'sessionStorage':
          return this.removeFromSessionStorage(eventIds);
        case 'indexedDB':
          return await this.removeFromIndexedDB(eventIds);
        default:
          return false;
      }
    } catch (error) {
      console.error('Failed to remove events:', error);
      return false;
    }
  }

  // 清空所有存储的数据
  async clearStorage(): Promise<boolean> {
    try {
      switch (this.config.storageType) {
        case 'localStorage':
          localStorage.removeItem(this.storageKey);
          return true;
        case 'sessionStorage':
          sessionStorage.removeItem(this.storageKey);
          return true;
        case 'indexedDB':
          return await this.clearIndexedDB();
        default:
          return false;
      }
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  // 获取存储统计信息
  async getStorageStats(): Promise<{
    totalCount: number;
    totalSize: number;
    expiredCount: number;
    storageType: string;
  }> {
    try {
      const events = await this.getStoredEvents();
      const now = Date.now();

      const totalCount = events.length;
      const expiredCount = events.filter(e => e.expiresAt <= now).length;

      // 估算存储大小
      const totalSize = JSON.stringify(events).length;

      return {
        totalCount,
        totalSize,
        expiredCount,
        storageType: this.config.storageType,
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalCount: 0,
        totalSize: 0,
        expiredCount: 0,
        storageType: this.config.storageType,
      };
    }
  }

  // 检查存储空间是否充?  async hasEnoughSpace(requiredSize: number = 0): Promise<boolean> {
    try {
      const stats = await this.getStorageStats();
      return stats.totalSize + requiredSize <= this.config.maxSize;
    } catch (error) {
      return false;
    }
  }

  // 私有方法：localStorage存储
  private storeInLocalStorage(event: StoredEvent): boolean {
    try {
      const existingData = this.getFromLocalStorage();
      existingData.push(event);

      // 检查大小限?      const serializedData = JSON.stringify(existingData);
      if (serializedData.length > this.config.maxSize) {
        // 如果超出限制，删除最旧的事件
        existingData.shift();
      }

      localStorage.setItem(this.storageKey, JSON.stringify(existingData));
      return true;
    } catch (error) {
      console.error('localStorage storage failed:', error);
      return false;
    }
  }

  private getFromLocalStorage(): StoredEvent[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('localStorage retrieval failed:', error);
      return [];
    }
  }

  private removeFromLocalStorage(eventIds: string[]): boolean {
    try {
      const events = this.getFromLocalStorage();
      const filteredEvents = events.filter(
        event => !eventIds.includes(event.id)
      );
      localStorage.setItem(this.storageKey, JSON.stringify(filteredEvents));
      return true;
    } catch (error) {
      console.error('localStorage removal failed:', error);
      return false;
    }
  }

  // 私有方法：sessionStorage存储
  private storeInSessionStorage(event: StoredEvent): boolean {
    try {
      const existingData = this.getFromSessionStorage();
      existingData.push(event);

      const serializedData = JSON.stringify(existingData);
      if (serializedData.length > this.config.maxSize) {
        existingData.shift();
      }

      sessionStorage.setItem(this.storageKey, JSON.stringify(existingData));
      return true;
    } catch (error) {
      console.error('sessionStorage storage failed:', error);
      return false;
    }
  }

  private getFromSessionStorage(): StoredEvent[] {
    try {
      const data = sessionStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('sessionStorage retrieval failed:', error);
      return [];
    }
  }

  private removeFromSessionStorage(eventIds: string[]): boolean {
    try {
      const events = this.getFromSessionStorage();
      const filteredEvents = events.filter(
        event => !eventIds.includes(event.id)
      );
      sessionStorage.setItem(this.storageKey, JSON.stringify(filteredEvents));
      return true;
    } catch (error) {
      console.error('sessionStorage removal failed:', error);
      return false;
    }
  }

  // 私有方法：IndexedDB存储
  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TrackingDB', 1);

      request.onerror = () => {
        console.error('IndexedDB initialization failed:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.isIndexedDBReady = true;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('events')) {
          const store = db.createObjectStore('events', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });
  }

  private async storeInIndexedDB(event: StoredEvent): Promise<boolean> {
    if (!this.isIndexedDBReady) {
      await this.initializeIndexedDB();
    }

    return new Promise(resolve => {
      const request = indexedDB.open('TrackingDB', 1);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['events'], 'readwrite');
        const store = transaction.objectStore('events');

        const addRequest = store.add(event);

        addRequest.onsuccess = () => resolve(true);
        addRequest.onerror = () => {
          console.error('IndexedDB store failed:', addRequest.error);
          resolve(false);
        };
      };

      request.onerror = () => {
        console.error('IndexedDB connection failed:', request.error);
        resolve(false);
      };
    });
  }

  private async getFromIndexedDB(): Promise<StoredEvent[]> {
    if (!this.isIndexedDBReady) return [];

    return new Promise(resolve => {
      const request = indexedDB.open('TrackingDB', 1);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['events'], 'readonly');
        const store = transaction.objectStore('events');

        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => resolve(getAllRequest.result);
        getAllRequest.onerror = () => {
          console.error('IndexedDB retrieval failed:', getAllRequest.error);
          resolve([]);
        };
      };

      request.onerror = () => {
        console.error('IndexedDB connection failed:', request.error);
        resolve([]);
      };
    });
  }

  private async removeFromIndexedDB(eventIds: string[]): Promise<boolean> {
    if (!this.isIndexedDBReady) return false;

    return new Promise(resolve => {
      const request = indexedDB.open('TrackingDB', 1);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['events'], 'readwrite');
        const store = transaction.objectStore('events');

        let completed = 0;
        const total = eventIds.length;

        eventIds.forEach(id => {
          const deleteRequest = store.delete(id);
          deleteRequest.onsuccess = () => {
            completed++;
            if (completed === total) resolve(true);
          };
          deleteRequest.onerror = () => {
            console.error('IndexedDB delete failed:', deleteRequest.error);
            completed++;
            if (completed === total) resolve(false);
          };
        });
      };

      request.onerror = () => {
        console.error('IndexedDB connection failed:', request.error);
        resolve(false);
      };
    });
  }

  private async clearIndexedDB(): Promise<boolean> {
    if (!this.isIndexedDBReady) return false;

    return new Promise(resolve => {
      const request = indexedDB.open('TrackingDB', 1);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['events'], 'readwrite');
        const store = transaction.objectStore('events');

        const clearRequest = store.clear();

        clearRequest.onsuccess = () => resolve(true);
        clearRequest.onerror = () => {
          console.error('IndexedDB clear failed:', clearRequest.error);
          resolve(false);
        };
      };

      request.onerror = () => {
        console.error('IndexedDB connection failed:', request.error);
        resolve(false);
      };
    });
  }

  // 私有方法：工具函?  private generateId(): string {
    return `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
