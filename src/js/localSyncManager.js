// 本地同步管理器 - 瀏覽器版本
// 使用 localStorage 替代檔案系統

class LocalSyncManager {
    constructor() {
        this.storageKey = 'contentful-sync-queue';
        this.loadSyncQueue();
    }

    // 載入同步佇列
    loadSyncQueue() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                this.syncQueue = JSON.parse(data);
            } else {
                this.syncQueue = {
                    pendingFood: [],
                    pendingSubscriptions: [],
                    lastSync: null
                };
            }
        } catch (error) {
            console.error('載入同步佇列失敗:', error);
            this.syncQueue = {
                pendingFood: [],
                pendingSubscriptions: [],
                lastSync: null
            };
        }
    }

    // 儲存同步佇列
    saveSyncQueue() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.syncQueue));
        } catch (error) {
            console.error('儲存同步佇列失敗:', error);
        }
    }

    // 新增食品到同步佇列
    addFoodToSyncQueue(foodData) {
        const syncItem = {
            id: Date.now(),
            action: 'create',
            type: 'food',
            data: foodData,
            timestamp: new Date().toISOString(),
            synced: false
        };

        this.syncQueue.pendingFood.push(syncItem);
        this.saveSyncQueue();
        
        console.log('✅ 食品已加入同步佇列:', syncItem.id);
        return syncItem.id;
    }

    // 新增訂閱到同步佇列
    addSubscriptionToSyncQueue(subscriptionData) {
        const syncItem = {
            id: Date.now(),
            action: 'create',
            type: 'subscription',
            data: subscriptionData,
            timestamp: new Date().toISOString(),
            synced: false
        };

        this.syncQueue.pendingSubscriptions.push(syncItem);
        this.saveSyncQueue();
        
        console.log('✅ 訂閱已加入同步佇列:', syncItem.id);
        return syncItem.id;
    }

    // 新增刪除操作到同步佇列
    addDeleteToSyncQueue(type, contentfulId) {
        const syncItem = {
            id: Date.now(),
            action: 'delete',
            type: type,
            contentfulId: contentfulId,
            timestamp: new Date().toISOString(),
            synced: false
        };

        if (type === 'food') {
            this.syncQueue.pendingFood.push(syncItem);
        } else if (type === 'subscription') {
            this.syncQueue.pendingSubscriptions.push(syncItem);
        }
        
        this.saveSyncQueue();
        
        console.log(`✅ ${type} 刪除操作已加入同步佇列:`, syncItem.id);
        return syncItem.id;
    }

    // 新增更新操作到同步佇列
    addUpdateToSyncQueue(type, data) {
        const syncItem = {
            id: Date.now(),
            action: 'update',
            type: type,
            data: data,
            timestamp: new Date().toISOString(),
            synced: false
        };

        if (type === 'food') {
            this.syncQueue.pendingFood.push(syncItem);
        } else if (type === 'subscription') {
            this.syncQueue.pendingSubscriptions.push(syncItem);
        }
        
        this.saveSyncQueue();
        
        console.log(`✅ ${type} 更新操作已加入同步佇列:`, syncItem.id);
        return syncItem.id;
    }

    // 獲取待同步項目
    getPendingItems() {
        const pending = [
            ...this.syncQueue.pendingFood.filter(item => !item.synced),
            ...this.syncQueue.pendingSubscriptions.filter(item => !item.synced)
        ];

        return pending.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    // 標記項目為已同步
    markAsSynced(itemId) {
        // 在食品佇列中尋找
        const foodItem = this.syncQueue.pendingFood.find(item => item.id === itemId);
        if (foodItem) {
            foodItem.synced = true;
            foodItem.syncedAt = new Date().toISOString();
        }

        // 在訂閱佇列中尋找
        const subItem = this.syncQueue.pendingSubscriptions.find(item => item.id === itemId);
        if (subItem) {
            subItem.synced = true;
            subItem.syncedAt = new Date().toISOString();
        }

        this.syncQueue.lastSync = new Date().toISOString();
        this.saveSyncQueue();
    }

    // 生成同步報告
    generateSyncReport() {
        const pending = this.getPendingItems();
        const totalFood = this.syncQueue.pendingFood.length;
        const syncedFood = this.syncQueue.pendingFood.filter(item => item.synced).length;
        const totalSubs = this.syncQueue.pendingSubscriptions.length;
        const syncedSubs = this.syncQueue.pendingSubscriptions.filter(item => item.synced).length;

        return {
            summary: {
                totalItems: totalFood + totalSubs,
                syncedItems: syncedFood + syncedSubs,
                pendingItems: pending.length,
                lastSync: this.syncQueue.lastSync
            },
            food: {
                total: totalFood,
                synced: syncedFood,
                pending: totalFood - syncedFood
            },
            subscriptions: {
                total: totalSubs,
                synced: syncedSubs,
                pending: totalSubs - syncedSubs
            },
            pendingItems: pending
        };
    }

    // 匯出待同步資料為 JSON
    exportPendingData() {
        const pending = this.getPendingItems();
        const exportData = {
            exportTime: new Date().toISOString(),
            items: pending,
            instructions: {
                food: "請在 Contentful 後台手動創建 'food' 類型的條目",
                subscription: "請在 Contentful 後台手動創建 'subscription' 類型的條目",
                fields: {
                    food: ["name", "amount", "todate"],
                    subscription: ["name", "price", "nextdate", "site"]
                }
            }
        };

        // 在瀏覽器中，我們將資料下載為檔案
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contentful-export-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📄 匯出檔案已下載');
        return `contentful-export-${Date.now()}.json`;
    }

    // 清除已同步的項目
    clearSyncedItems() {
        this.syncQueue.pendingFood = this.syncQueue.pendingFood.filter(item => !item.synced);
        this.syncQueue.pendingSubscriptions = this.syncQueue.pendingSubscriptions.filter(item => !item.synced);
        this.saveSyncQueue();
        console.log('✅ 已清除已同步的項目');
    }

    // 清除所有同步佇列
    clearAllSyncQueue() {
        this.syncQueue = {
            pendingFood: [],
            pendingSubscriptions: [],
            lastSync: null
        };
        this.saveSyncQueue();
        console.log('✅ 已清除所有同步佇列');
    }
}

// 匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocalSyncManager;
}