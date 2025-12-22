// 測試 App 初始化和刪除功能
const ContentfulManager = require('./src/js/contentfulManager.js');
const CrudManager = require('./src/js/crudManager.js');

// 模擬 App 類別（簡化版）
class MockApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.contentfulManager = null;
        this.crudManager = null;
        this.crudManagerInitialized = false;
    }

    async init() {
        console.log('🚀 開始初始化 Mock App...');
        await this.initContentful();
        await this.initCrudManager();
        console.log('✅ Mock App 初始化完成');
    }

    async initContentful() {
        try {
            this.contentfulManager = new ContentfulManager();
            const connectionTest = await this.contentfulManager.testConnection();
            
            if (connectionTest.success) {
                console.log('✅ Contentful 連接成功');
            } else {
                console.warn('⚠️ Contentful 連接失敗，使用備用數據');
            }
        } catch (error) {
            console.error('初始化 Contentful 時發生錯誤:', error);
        }
    }

    async initCrudManager() {
        try {
            console.log('🔄 開始初始化 CRUD 管理器...');
            this.crudManager = new CrudManager(this.contentfulManager);
            const loaded = await this.crudManager.loadInitialData();
            
            if (loaded) {
                console.log('✅ CRUD 管理器初始化成功 (使用 Contentful 資料)');
            } else {
                console.log('✅ CRUD 管理器初始化成功 (使用本地資料)');
            }
            
            // 標記 CRUD 管理器已初始化
            this.crudManagerInitialized = true;
            console.log('✅ CRUD 管理器完全初始化完成');
        } catch (error) {
            console.error('初始化 CRUD 管理器時發生錯誤:', error);
            this.crudManagerInitialized = false;
        }
    }

    // 模擬刪除食品功能（與實際 app.js 相同的邏輯）
    deleteFood(foodId) {
        // 檢查 CRUD 管理器是否已初始化
        if (!this.crudManager || !this.crudManagerInitialized) {
            console.error('❌ CRUD 管理器未初始化，無法刪除');
            console.error('CRUD 管理器狀態:', {
                crudManager: !!this.crudManager,
                initialized: this.crudManagerInitialized
            });
            return { success: false, message: 'CRUD 管理器未初始化' };
        }

        const food = this.crudManager.readFood(foodId);
        if (!food) {
            console.error('❌ 找不到指定的食品');
            return { success: false, message: '找不到指定的食品' };
        }

        console.log(`🗑️ 準備刪除食品：${food.name} (ID: ${foodId})`);

        try {
            const result = this.crudManager.deleteFood(foodId);
            
            if (result.success) {
                console.log('✅ 食品刪除成功:', result.message);
                return result;
            } else {
                console.error('❌ 食品刪除失敗:', result.message);
                return result;
            }
        } catch (error) {
            console.error('❌ 刪除食品時發生錯誤:', error);
            return { success: false, message: '刪除時發生錯誤' };
        }
    }

    // 模擬刪除訂閱功能
    deleteSubscription(subscriptionId) {
        // 檢查 CRUD 管理器是否已初始化
        if (!this.crudManager || !this.crudManagerInitialized) {
            console.error('❌ CRUD 管理器未初始化，無法刪除');
            return { success: false, message: 'CRUD 管理器未初始化' };
        }

        const subscription = this.crudManager.readSubscription(subscriptionId);
        if (!subscription) {
            console.error('❌ 找不到指定的訂閱');
            return { success: false, message: '找不到指定的訂閱' };
        }

        console.log(`🗑️ 準備刪除訂閱：${subscription.name} (ID: ${subscriptionId})`);

        try {
            const result = this.crudManager.deleteSubscription(subscriptionId);
            
            if (result.success) {
                console.log('✅ 訂閱刪除成功:', result.message);
                return result;
            } else {
                console.error('❌ 訂閱刪除失敗:', result.message);
                return result;
            }
        } catch (error) {
            console.error('❌ 刪除訂閱時發生錯誤:', error);
            return { success: false, message: '刪除時發生錯誤' };
        }
    }

    // 顯示當前狀態
    showStatus() {
        console.log('\n📊 當前狀態:');
        console.log('   CRUD 管理器:', this.crudManager ? '✅ 已載入' : '❌ 未載入');
        console.log('   初始化狀態:', this.crudManagerInitialized ? '✅ 已完成' : '❌ 未完成');
        if (this.crudManager) {
            console.log('   食品數量:', this.crudManager.foodItems.length);
            console.log('   訂閱數量:', this.crudManager.subscriptions.length);
        }
    }
}

async function testAppInitializationAndDelete() {
    console.log('🧪 測試 App 初始化和刪除功能\n');

    // 創建 Mock App 實例
    const app = new MockApp();
    
    // 初始化
    await app.init();
    
    // 顯示初始狀態
    app.showStatus();

    // 測試新增和刪除食品
    console.log('\n🍎 測試食品功能...');
    const newFood = await app.crudManager.createFood({
        name: '測試刪除功能食品',
        brand: '測試品牌',
        price: 'NT$ 1',
        status: '良好',
        expiry: '2025-12-31'
    });

    if (newFood.success) {
        console.log('✅ 食品新增成功，ID:', newFood.data.id);
        
        // 測試刪除
        const deleteResult = app.deleteFood(newFood.data.id);
        console.log('刪除測試結果:', deleteResult.success ? '✅ 成功' : '❌ 失敗');
    }

    // 測試新增和刪除訂閱
    console.log('\n📊 測試訂閱功能...');
    const newSubscription = await app.crudManager.createSubscription({
        name: '測試刪除功能訂閱',
        url: 'https://test-delete.example.com',
        price: 'NT$ 1',
        nextPayment: '2025-12-31'
    });

    if (newSubscription.success) {
        console.log('✅ 訂閱新增成功，ID:', newSubscription.data.id);
        
        // 測試刪除
        const deleteResult = app.deleteSubscription(newSubscription.data.id);
        console.log('刪除測試結果:', deleteResult.success ? '✅ 成功' : '❌ 失敗');
    }

    // 顯示最終狀態
    app.showStatus();

    console.log('\n🎉 測試完成！刪除功能應該正常工作。');
    console.log('\n💡 如果在實際應用中仍有問題，請：');
    console.log('1. 檢查瀏覽器控制台的錯誤訊息');
    console.log('2. 確認 CRUD 管理器已完全初始化');
    console.log('3. 使用 check-crud-status.html 進行診斷');
}

testAppInitializationAndDelete().catch(console.error);