// 替代同步解決方案
// 由於 Management Token 權限問題，我們實作一個本地儲存 + 手動同步的方案

const fs = require('fs');
const path = require('path');

class LocalSyncManager {
    constructor() {
        this.syncDataFile = path.join(__dirname, 'sync-queue.json');
        this.loadSyncQueue();
    }

    // 載入同步佇列
    loadSyncQueue() {
        try {
            if (fs.existsSync(this.syncDataFile)) {
                const data = fs.readFileSync(this.syncDataFile, 'utf8');
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
            fs.writeFileSync(this.syncDataFile, JSON.stringify(this.syncQueue, null, 2));
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

        const exportFile = path.join(__dirname, `contentful-export-${Date.now()}.json`);
        fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));
        
        console.log('📄 匯出檔案已創建:', exportFile);
        return exportFile;
    }
}

// 測試替代同步方案
async function testAlternativeSync() {
    console.log('🔄 測試替代同步方案\n');

    const syncManager = new LocalSyncManager();

    // 模擬新增食品
    console.log('1. 新增測試食品到同步佇列...');
    const foodId = syncManager.addFoodToSyncQueue({
        name: '測試食品 - 替代方案',
        brand: '測試品牌',
        expiry: '2025-12-31'
    });

    // 模擬新增訂閱
    console.log('2. 新增測試訂閱到同步佇列...');
    const subId = syncManager.addSubscriptionToSyncQueue({
        name: '測試訂閱 - 替代方案',
        url: 'https://example.com',
        price: 'NT$ 99',
        nextPayment: '2025-12-31'
    });

    // 生成報告
    console.log('\n3. 同步狀態報告:');
    const report = syncManager.generateSyncReport();
    console.log('   總項目:', report.summary.totalItems);
    console.log('   待同步:', report.summary.pendingItems);
    console.log('   已同步:', report.summary.syncedItems);

    // 匯出待同步資料
    console.log('\n4. 匯出待同步資料...');
    const exportFile = syncManager.exportPendingData();

    console.log('\n📋 使用說明:');
    console.log('1. 查看匯出的 JSON 檔案');
    console.log('2. 手動在 Contentful 後台創建對應條目');
    console.log('3. 使用 syncManager.markAsSynced(itemId) 標記為已同步');

    return syncManager;
}

// 如果直接執行此檔案
if (require.main === module) {
    testAlternativeSync().catch(console.error);
}

module.exports = LocalSyncManager;