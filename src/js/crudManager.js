// CRUD 管理模組
class CrudManager {
    constructor(contentfulManager = null) {
        this.foodItems = [];
        this.subscriptions = [];
        this.nextFoodId = 1;
        this.nextSubscriptionId = 1;
        this.contentfulManager = contentfulManager;
        this.isOnline = true;
        
        // 初始化本地同步管理器
        if (typeof LocalSyncManager !== 'undefined') {
            this.localSyncManager = new LocalSyncManager();
            console.log('✅ 本地同步管理器已初始化');
        } else {
            this.localSyncManager = null;
            console.warn('⚠️ LocalSyncManager 未找到，同步功能將受限');
        }
    }

    // 從 Contentful 載入資料
    async loadFromContentful() {
        if (!this.contentfulManager) {
            console.warn('⚠️ ContentfulManager 未提供，使用本地資料');
            return false;
        }

        try {
            console.log('🔄 正在從 Contentful 載入資料...');
            
            // 測試連接
            const connectionTest = await this.contentfulManager.testConnection();
            if (!connectionTest.success) {
                throw new Error('Contentful 連接失敗');
            }

            // 載入食品資料
            const foods = await this.contentfulManager.getFoodItems();
            console.log('✅ 從 Contentful 載入食品:', foods.length, '項');
            
            // 載入訂閱資料
            const subscriptions = await this.contentfulManager.getSubscriptions();
            console.log('✅ 從 Contentful 載入訂閱:', subscriptions.length, '項');

            // 更新本地資料
            this.foodItems = foods.map((food, index) => ({
                id: index + 1,
                name: food.name,
                brand: food.brand,
                price: food.price,
                status: food.status,
                expiry: food.expiry,
                daysLeft: this.calculateDaysLeft(food.expiry),
                createdAt: new Date(),
                updatedAt: new Date(),
                contentfulId: food.contentfulId || null // 保存 Contentful ID
            }));

            this.subscriptions = subscriptions.map((sub, index) => ({
                id: index + 1,
                name: sub.name,
                url: sub.url,
                price: sub.price,
                nextPayment: sub.nextPayment,
                daysLeft: this.calculateDaysLeft(sub.nextPayment),
                status: this.getSubscriptionStatus(sub.nextPayment),
                createdAt: new Date(),
                updatedAt: new Date(),
                contentfulId: sub.contentfulId || null // 保存 Contentful ID
            }));

            this.nextFoodId = this.foodItems.length + 1;
            this.nextSubscriptionId = this.subscriptions.length + 1;
            this.isOnline = true;

            console.log('✅ Contentful 資料載入完成');
            console.log(`   - 食品: ${this.foodItems.length} 項`);
            console.log(`   - 訂閱: ${this.subscriptions.length} 項`);
            
            return true;
        } catch (error) {
            console.error('❌ 從 Contentful 載入資料失敗:', error);
            this.isOnline = false;
            return false;
        }
    }

    // ========== 食品管理 CRUD ==========

    // 創建食品
    async createFood(foodData) {
        const newFood = {
            id: this.nextFoodId++,
            name: foodData.name || '未命名食品',
            brand: foodData.brand || '未知品牌',
            price: foodData.price || 'NT$ 0',
            status: foodData.status || '良好',
            expiry: foodData.expiry || this.getDefaultExpiryDate(),
            daysLeft: this.calculateDaysLeft(foodData.expiry || this.getDefaultExpiryDate()),
            createdAt: new Date(),
            updatedAt: new Date(),
            contentfulId: null // 用於追蹤 Contentful 條目 ID
        };

        this.foodItems.push(newFood);
        console.log('新增食品:', newFood);

        // 嘗試同步到 Contentful
        if (this.contentfulManager && this.isOnline) {
            try {
                const result = await this.contentfulManager.createFoodEntry(newFood);
                if (result.success) {
                    newFood.contentfulId = result.entryId;
                    console.log('✅ 食品已同步到 Contentful:', result.entryId);
                } else {
                    console.warn('⚠️ 食品同步到 Contentful 失敗:', result.error);
                    // 加入本地同步佇列作為備用方案
                    if (this.localSyncManager) {
                        const syncId = this.localSyncManager.addFoodToSyncQueue(newFood);
                        newFood.syncQueueId = syncId;
                        console.log('📝 已加入本地同步佇列:', syncId);
                    }
                }
            } catch (error) {
                console.error('❌ 同步食品到 Contentful 時發生錯誤:', error);
                // 加入本地同步佇列作為備用方案
                if (this.localSyncManager) {
                    const syncId = this.localSyncManager.addFoodToSyncQueue(newFood);
                    newFood.syncQueueId = syncId;
                    console.log('📝 已加入本地同步佇列:', syncId);
                }
            }
        } else if (this.localSyncManager) {
            // 如果沒有 Contentful 連接，直接加入本地同步佇列
            const syncId = this.localSyncManager.addFoodToSyncQueue(newFood);
            newFood.syncQueueId = syncId;
            console.log('📝 已加入本地同步佇列:', syncId);
        }

        return { success: true, data: newFood, message: '食品新增成功' };
    }

    // 讀取所有食品
    readAllFood() {
        return this.foodItems.sort((a, b) => b.updatedAt - a.updatedAt);
    }

    // 讀取單一食品
    readFood(id) {
        const food = this.foodItems.find(item => item.id === parseInt(id));
        return food || null;
    }

    // 更新食品
    async updateFood(id, updateData) {
        const index = this.foodItems.findIndex(item => item.id === parseInt(id));
        
        if (index === -1) {
            return { success: false, message: '找不到指定的食品' };
        }

        const updatedFood = {
            ...this.foodItems[index],
            ...updateData,
            daysLeft: this.calculateDaysLeft(updateData.expiry || this.foodItems[index].expiry),
            updatedAt: new Date()
        };

        this.foodItems[index] = updatedFood;
        console.log('更新食品:', updatedFood);

        // 嘗試同步到 Contentful
        if (this.contentfulManager && this.isOnline && updatedFood.contentfulId) {
            try {
                const result = await this.contentfulManager.updateFoodEntry(updatedFood.contentfulId, updatedFood);
                if (result.success) {
                    console.log('✅ 食品更新已同步到 Contentful:', updatedFood.contentfulId);
                } else {
                    console.warn('⚠️ 食品更新同步到 Contentful 失敗:', result.error);
                    // 加入本地同步佇列作為備用方案
                    if (this.localSyncManager) {
                        const syncId = this.localSyncManager.addUpdateToSyncQueue('food', updatedFood);
                        updatedFood.syncQueueId = syncId;
                        console.log('📝 已加入更新同步佇列:', syncId);
                    }
                }
            } catch (error) {
                console.error('❌ 同步食品更新到 Contentful 時發生錯誤:', error);
                // 加入本地同步佇列作為備用方案
                if (this.localSyncManager) {
                    const syncId = this.localSyncManager.addUpdateToSyncQueue('food', updatedFood);
                    updatedFood.syncQueueId = syncId;
                    console.log('📝 已加入更新同步佇列:', syncId);
                }
            }
        } else if (this.localSyncManager) {
            // 如果沒有 Contentful 連接，直接加入本地同步佇列
            const syncId = this.localSyncManager.addUpdateToSyncQueue('food', updatedFood);
            updatedFood.syncQueueId = syncId;
            console.log('📝 已加入更新同步佇列:', syncId);
        }

        return { success: true, data: updatedFood, message: '食品更新成功' };
    }

    // 刪除食品
    async deleteFood(id) {
        const index = this.foodItems.findIndex(item => item.id === parseInt(id));
        
        if (index === -1) {
            return { success: false, message: '找不到指定的食品' };
        }

        const deletedFood = this.foodItems.splice(index, 1)[0];
        console.log('刪除食品:', deletedFood);

        // 嘗試從 Contentful 刪除
        if (this.contentfulManager && this.isOnline && deletedFood.contentfulId) {
            try {
                const result = await this.contentfulManager.deleteEntry(deletedFood.contentfulId);
                if (result.success) {
                    console.log('✅ 食品已從 Contentful 刪除:', deletedFood.contentfulId);
                } else {
                    console.warn('⚠️ 從 Contentful 刪除食品失敗:', result.error);
                    // 加入本地同步佇列作為備用方案
                    if (this.localSyncManager) {
                        const syncId = this.localSyncManager.addDeleteToSyncQueue('food', deletedFood.contentfulId);
                        console.log('📝 已加入刪除同步佇列:', syncId);
                    }
                }
            } catch (error) {
                console.error('❌ 從 Contentful 刪除食品時發生錯誤:', error);
                // 加入本地同步佇列作為備用方案
                if (this.localSyncManager) {
                    const syncId = this.localSyncManager.addDeleteToSyncQueue('food', deletedFood.contentfulId);
                    console.log('📝 已加入刪除同步佇列:', syncId);
                }
            }
        } else if (this.localSyncManager && deletedFood.contentfulId) {
            // 如果沒有 Contentful 連接，直接加入本地同步佇列
            const syncId = this.localSyncManager.addDeleteToSyncQueue('food', deletedFood.contentfulId);
            console.log('📝 已加入刪除同步佇列:', syncId);
        }

        return { success: true, data: deletedFood, message: '食品刪除成功' };
    }

    // ========== 訂閱管理 CRUD ==========

    // 創建訂閱
    async createSubscription(subscriptionData) {
        const newSubscription = {
            id: this.nextSubscriptionId++,
            name: subscriptionData.name || '未命名訂閱',
            url: subscriptionData.url || '',
            price: subscriptionData.price || 'NT$ 0',
            nextPayment: subscriptionData.nextPayment || this.getDefaultPaymentDate(),
            daysLeft: this.calculateDaysLeft(subscriptionData.nextPayment || this.getDefaultPaymentDate()),
            status: this.getSubscriptionStatus(subscriptionData.nextPayment || this.getDefaultPaymentDate()),
            createdAt: new Date(),
            updatedAt: new Date(),
            contentfulId: null // 用於追蹤 Contentful 條目 ID
        };

        this.subscriptions.push(newSubscription);
        console.log('新增訂閱:', newSubscription);

        // 嘗試同步到 Contentful
        if (this.contentfulManager && this.isOnline) {
            try {
                const result = await this.contentfulManager.createSubscriptionEntry(newSubscription);
                if (result.success) {
                    newSubscription.contentfulId = result.entryId;
                    console.log('✅ 訂閱已同步到 Contentful:', result.entryId);
                } else {
                    console.warn('⚠️ 訂閱同步到 Contentful 失敗:', result.error);
                    // 加入本地同步佇列作為備用方案
                    if (this.localSyncManager) {
                        const syncId = this.localSyncManager.addSubscriptionToSyncQueue(newSubscription);
                        newSubscription.syncQueueId = syncId;
                        console.log('📝 已加入本地同步佇列:', syncId);
                    }
                }
            } catch (error) {
                console.error('❌ 同步訂閱到 Contentful 時發生錯誤:', error);
                // 加入本地同步佇列作為備用方案
                if (this.localSyncManager) {
                    const syncId = this.localSyncManager.addSubscriptionToSyncQueue(newSubscription);
                    newSubscription.syncQueueId = syncId;
                    console.log('📝 已加入本地同步佇列:', syncId);
                }
            }
        } else if (this.localSyncManager) {
            // 如果沒有 Contentful 連接，直接加入本地同步佇列
            const syncId = this.localSyncManager.addSubscriptionToSyncQueue(newSubscription);
            newSubscription.syncQueueId = syncId;
            console.log('📝 已加入本地同步佇列:', syncId);
        }

        return { success: true, data: newSubscription, message: '訂閱新增成功' };
    }

    // 讀取所有訂閱
    readAllSubscriptions() {
        return this.subscriptions.sort((a, b) => b.updatedAt - a.updatedAt);
    }

    // 讀取單一訂閱
    readSubscription(id) {
        const subscription = this.subscriptions.find(item => item.id === parseInt(id));
        return subscription || null;
    }

    // 更新訂閱
    async updateSubscription(id, updateData) {
        const index = this.subscriptions.findIndex(item => item.id === parseInt(id));
        
        if (index === -1) {
            return { success: false, message: '找不到指定的訂閱' };
        }

        const updatedSubscription = {
            ...this.subscriptions[index],
            ...updateData,
            daysLeft: this.calculateDaysLeft(updateData.nextPayment || this.subscriptions[index].nextPayment),
            status: this.getSubscriptionStatus(updateData.nextPayment || this.subscriptions[index].nextPayment),
            updatedAt: new Date()
        };

        this.subscriptions[index] = updatedSubscription;
        console.log('更新訂閱:', updatedSubscription);

        // 嘗試同步到 Contentful
        if (this.contentfulManager && this.isOnline && updatedSubscription.contentfulId) {
            try {
                const result = await this.contentfulManager.updateSubscriptionEntry(updatedSubscription.contentfulId, updatedSubscription);
                if (result.success) {
                    console.log('✅ 訂閱更新已同步到 Contentful:', updatedSubscription.contentfulId);
                } else {
                    console.warn('⚠️ 訂閱更新同步到 Contentful 失敗:', result.error);
                    // 加入本地同步佇列作為備用方案
                    if (this.localSyncManager) {
                        const syncId = this.localSyncManager.addUpdateToSyncQueue('subscription', updatedSubscription);
                        updatedSubscription.syncQueueId = syncId;
                        console.log('📝 已加入更新同步佇列:', syncId);
                    }
                }
            } catch (error) {
                console.error('❌ 同步訂閱更新到 Contentful 時發生錯誤:', error);
                // 加入本地同步佇列作為備用方案
                if (this.localSyncManager) {
                    const syncId = this.localSyncManager.addUpdateToSyncQueue('subscription', updatedSubscription);
                    updatedSubscription.syncQueueId = syncId;
                    console.log('📝 已加入更新同步佇列:', syncId);
                }
            }
        } else if (this.localSyncManager) {
            // 如果沒有 Contentful 連接，直接加入本地同步佇列
            const syncId = this.localSyncManager.addUpdateToSyncQueue('subscription', updatedSubscription);
            updatedSubscription.syncQueueId = syncId;
            console.log('📝 已加入更新同步佇列:', syncId);
        }

        return { success: true, data: updatedSubscription, message: '訂閱更新成功' };
    }

    // 刪除訂閱
    async deleteSubscription(id) {
        const index = this.subscriptions.findIndex(item => item.id === parseInt(id));
        
        if (index === -1) {
            return { success: false, message: '找不到指定的訂閱' };
        }

        const deletedSubscription = this.subscriptions.splice(index, 1)[0];
        console.log('刪除訂閱:', deletedSubscription);

        // 嘗試從 Contentful 刪除
        if (this.contentfulManager && this.isOnline && deletedSubscription.contentfulId) {
            try {
                const result = await this.contentfulManager.deleteEntry(deletedSubscription.contentfulId);
                if (result.success) {
                    console.log('✅ 訂閱已從 Contentful 刪除:', deletedSubscription.contentfulId);
                } else {
                    console.warn('⚠️ 從 Contentful 刪除訂閱失敗:', result.error);
                    // 加入本地同步佇列作為備用方案
                    if (this.localSyncManager) {
                        const syncId = this.localSyncManager.addDeleteToSyncQueue('subscription', deletedSubscription.contentfulId);
                        console.log('📝 已加入刪除同步佇列:', syncId);
                    }
                }
            } catch (error) {
                console.error('❌ 從 Contentful 刪除訂閱時發生錯誤:', error);
                // 加入本地同步佇列作為備用方案
                if (this.localSyncManager) {
                    const syncId = this.localSyncManager.addDeleteToSyncQueue('subscription', deletedSubscription.contentfulId);
                    console.log('📝 已加入刪除同步佇列:', syncId);
                }
            }
        } else if (this.localSyncManager && deletedSubscription.contentfulId) {
            // 如果沒有 Contentful 連接，直接加入本地同步佇列
            const syncId = this.localSyncManager.addDeleteToSyncQueue('subscription', deletedSubscription.contentfulId);
            console.log('📝 已加入刪除同步佇列:', syncId);
        }

        return { success: true, data: deletedSubscription, message: '訂閱刪除成功' };
    }

    // ========== 輔助函數 ==========

    // 計算剩餘天數
    calculateDaysLeft(dateString) {
        if (!dateString) return 0;
        
        const targetDate = new Date(dateString);
        const today = new Date();
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(0, diffDays);
    }

    // 獲取訂閱狀態
    getSubscriptionStatus(nextPayment) {
        const daysLeft = this.calculateDaysLeft(nextPayment);
        
        if (daysLeft <= 3) return '即將到期';
        if (daysLeft <= 7) return '注意';
        return '活躍';
    }

    // 獲取預設到期日期（30天後）
    getDefaultExpiryDate() {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString().split('T')[0];
    }

    // 獲取預設付款日期（30天後）
    getDefaultPaymentDate() {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString().split('T')[0];
    }

    // 格式化日期
    formatDate(date) {
        if (!date) return '';
        return new Date(date).toISOString().split('T')[0];
    }

    // 搜尋食品
    searchFood(query) {
        if (!query) return this.readAllFood();
        
        const lowerQuery = query.toLowerCase();
        return this.foodItems.filter(food => 
            food.name.toLowerCase().includes(lowerQuery) ||
            food.brand.toLowerCase().includes(lowerQuery) ||
            food.status.toLowerCase().includes(lowerQuery)
        );
    }

    // 搜尋訂閱
    searchSubscriptions(query) {
        if (!query) return this.readAllSubscriptions();
        
        const lowerQuery = query.toLowerCase();
        return this.subscriptions.filter(sub => 
            sub.name.toLowerCase().includes(lowerQuery) ||
            sub.url.toLowerCase().includes(lowerQuery) ||
            sub.status.toLowerCase().includes(lowerQuery)
        );
    }

    // 載入初始數據
    async loadInitialData() {
        console.log('🚀 開始載入初始數據...');
        
        // 嘗試從 Contentful 載入
        const contentfulLoaded = await this.loadFromContentful();
        
        if (!contentfulLoaded) {
            console.log('⚠️ Contentful 載入失敗，使用本地示例數據');
            this.loadLocalFallbackData();
        }
        
        console.log('✅ 初始數據載入完成');
        return contentfulLoaded;
    }

    // 載入本地備用數據
    loadLocalFallbackData() {
        // 載入一些示例數據
        this.createFood({
            name: '【張君雅】五香海苔休閒丸子',
            brand: '張君雅',
            price: 'NT$ 25',
            status: '良好',
            expiry: '2026-01-06'
        });

        this.createFood({
            name: '【張君雅】日式串燒休閒丸子',
            brand: '張君雅',
            price: 'NT$ 25',
            status: '良好',
            expiry: '2026-01-07'
        });

        this.createSubscription({
            name: '天虎/黃信訊/心臟內科',
            url: 'https://www.tcmg.com.tw/index.php/main/schedule_time?id=18',
            price: 'NT$ 530',
            nextPayment: '2025-12-26'
        });

        this.createSubscription({
            name: 'kiro pro',
            url: 'https://app.kiro.dev/account/',
            price: 'NT$ 640',
            nextPayment: '2026-01-01'
        });

        console.log('✅ 本地備用數據載入完成');
    }

    // 獲取統計數據
    getFoodStats() {
        const foods = this.readAllFood();
        return {
            total: foods.length,
            expiring3Days: foods.filter(food => food.daysLeft <= 3).length,
            expiring7Days: foods.filter(food => food.daysLeft <= 7).length,
            expiring30Days: foods.filter(food => food.daysLeft <= 30).length,
            expired: foods.filter(food => food.daysLeft <= 0).length
        };
    }

    getSubscriptionStats() {
        const subs = this.readAllSubscriptions();
        return {
            total: subs.length,
            expiring3Days: subs.filter(sub => sub.daysLeft <= 3).length,
            expiring7Days: subs.filter(sub => sub.daysLeft <= 7).length,
            expired: subs.filter(sub => sub.daysLeft <= 0).length,
            active: subs.filter(sub => sub.status === '活躍').length
        };
    }

    // ========== 同步管理功能 ==========

    // 獲取同步狀態報告
    getSyncReport() {
        if (!this.localSyncManager) {
            return { error: '本地同步管理器未初始化' };
        }
        return this.localSyncManager.generateSyncReport();
    }

    // 匯出待同步資料
    exportPendingSync() {
        if (!this.localSyncManager) {
            return { error: '本地同步管理器未初始化' };
        }
        return this.localSyncManager.exportPendingData();
    }

    // 標記項目為已同步
    markItemAsSynced(syncQueueId) {
        if (!this.localSyncManager) {
            return { success: false, message: '本地同步管理器未初始化' };
        }
        
        this.localSyncManager.markAsSynced(syncQueueId);
        return { success: true, message: '項目已標記為已同步' };
    }

    // 獲取待同步項目列表
    getPendingSyncItems() {
        if (!this.localSyncManager) {
            return [];
        }
        return this.localSyncManager.getPendingItems();
    }
}

// 匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrudManager;
}