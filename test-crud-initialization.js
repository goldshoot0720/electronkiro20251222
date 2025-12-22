// 測試 CRUD 管理器初始化問題
const ContentfulManager = require('./src/js/contentfulManager.js');
const CrudManager = require('./src/js/crudManager.js');

async function testCrudInitialization() {
    console.log('🔍 診斷 CRUD 管理器初始化問題\n');

    console.log('1. 測試 ContentfulManager 初始化...');
    const contentfulManager = new ContentfulManager();
    console.log('   ContentfulManager:', contentfulManager ? '✅ 成功' : '❌ 失敗');

    console.log('\n2. 測試 CrudManager 初始化...');
    const crudManager = new CrudManager(contentfulManager);
    console.log('   CrudManager:', crudManager ? '✅ 成功' : '❌ 失敗');
    console.log('   foodItems 陣列:', Array.isArray(crudManager.foodItems) ? '✅ 正常' : '❌ 異常');
    console.log('   subscriptions 陣列:', Array.isArray(crudManager.subscriptions) ? '✅ 正常' : '❌ 異常');

    console.log('\n3. 載入初始資料...');
    await crudManager.loadInitialData();
    console.log('   食品數量:', crudManager.foodItems.length);
    console.log('   訂閱數量:', crudManager.subscriptions.length);

    console.log('\n4. 測試新增功能...');
    const newFood = await crudManager.createFood({
        name: '測試食品 - CRUD 診斷',
        brand: '測試品牌',
        price: 'NT$ 50',
        status: '良好',
        expiry: '2025-12-31'
    });
    console.log('   新增食品結果:', newFood.success ? '✅ 成功' : '❌ 失敗');
    console.log('   新增後食品數量:', crudManager.foodItems.length);

    if (newFood.success) {
        const foodId = newFood.data.id;
        console.log('   新增的食品 ID:', foodId);

        console.log('\n5. 測試讀取功能...');
        const readFood = crudManager.readFood(foodId);
        console.log('   讀取食品結果:', readFood ? '✅ 成功' : '❌ 失敗');
        if (readFood) {
            console.log('   食品名稱:', readFood.name);
        }

        console.log('\n6. 測試刪除功能...');
        const deleteResult = crudManager.deleteFood(foodId);
        console.log('   刪除結果:', deleteResult.success ? '✅ 成功' : '❌ 失敗');
        console.log('   刪除訊息:', deleteResult.message);
        console.log('   刪除後食品數量:', crudManager.foodItems.length);

        // 驗證刪除是否真的成功
        const deletedFood = crudManager.readFood(foodId);
        console.log('   驗證刪除:', deletedFood ? '❌ 仍存在' : '✅ 已刪除');
    }

    console.log('\n7. 測試訂閱功能...');
    const newSubscription = await crudManager.createSubscription({
        name: '測試訂閱 - CRUD 診斷',
        url: 'https://test.example.com',
        price: 'NT$ 99',
        nextPayment: '2025-12-31'
    });
    console.log('   新增訂閱結果:', newSubscription.success ? '✅ 成功' : '❌ 失敗');

    if (newSubscription.success) {
        const subscriptionId = newSubscription.data.id;
        console.log('   新增的訂閱 ID:', subscriptionId);

        console.log('\n8. 測試訂閱刪除功能...');
        const deleteSubResult = crudManager.deleteSubscription(subscriptionId);
        console.log('   刪除訂閱結果:', deleteSubResult.success ? '✅ 成功' : '❌ 失敗');
        console.log('   刪除訊息:', deleteSubResult.message);
    }

    console.log('\n📊 最終狀態:');
    console.log('   食品總數:', crudManager.foodItems.length);
    console.log('   訂閱總數:', crudManager.subscriptions.length);
    console.log('   CRUD 管理器狀態:', crudManager ? '✅ 正常運作' : '❌ 異常');

    return crudManager;
}

// 模擬 App 類別的初始化過程
async function simulateAppInitialization() {
    console.log('\n🚀 模擬 App 初始化過程\n');

    // 模擬 App 類別
    const mockApp = {
        contentfulManager: null,
        crudManager: null,
        
        async initContentful() {
            this.contentfulManager = new ContentfulManager();
            console.log('✅ ContentfulManager 初始化完成');
        },
        
        async initCrudManager() {
            if (!this.contentfulManager) {
                console.log('❌ ContentfulManager 未初始化');
                return false;
            }
            
            this.crudManager = new CrudManager(this.contentfulManager);
            const loaded = await this.crudManager.loadInitialData();
            console.log('✅ CrudManager 初始化完成');
            return loaded;
        },
        
        deleteFood(foodId) {
            if (!this.crudManager) {
                console.log('❌ CRUD 管理器未初始化，無法刪除');
                return { success: false, message: 'CRUD 管理器未初始化' };
            }
            
            return this.crudManager.deleteFood(foodId);
        }
    };

    // 執行初始化
    await mockApp.initContentful();
    await mockApp.initCrudManager();

    // 測試刪除功能
    console.log('\n測試模擬 App 的刪除功能...');
    
    // 先新增一個食品
    const newFood = await mockApp.crudManager.createFood({
        name: '模擬 App 測試食品',
        brand: '測試',
        price: 'NT$ 1',
        expiry: '2025-12-31'
    });

    if (newFood.success) {
        const deleteResult = mockApp.deleteFood(newFood.data.id);
        console.log('刪除結果:', deleteResult.success ? '✅ 成功' : '❌ 失敗');
        console.log('刪除訊息:', deleteResult.message);
    }

    return mockApp;
}

// 執行測試
testCrudInitialization()
    .then(() => simulateAppInitialization())
    .catch(console.error);