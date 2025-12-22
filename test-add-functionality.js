// 測試新增功能修正
const ContentfulManager = require('./src/js/contentfulManager.js');
const CrudManager = require('./src/js/crudManager.js');

// 模擬 App 類別的新增功能
class MockAppWithAddFunctionality {
    constructor() {
        this.currentPage = 'dashboard';
        this.contentfulManager = null;
        this.crudManager = null;
        this.crudManagerInitialized = false;
    }

    async init() {
        console.log('🚀 開始初始化 Mock App (新增功能測試)...');
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

    // 模擬顯示食品表單功能
    showFoodForm(foodId = null) {
        // 檢查 CRUD 管理器是否已初始化
        if (!this.crudManager || !this.crudManagerInitialized) {
            console.error('❌ CRUD 管理器未初始化，無法顯示表單');
            console.error('CRUD 管理器狀態:', {
                crudManager: !!this.crudManager,
                initialized: this.crudManagerInitialized
            });
            return { success: false, message: 'CRUD 管理器未初始化' };
        }

        const isEdit = foodId !== null;
        const food = isEdit ? this.crudManager.readFood(foodId) : null;
        
        // 如果是編輯模式但找不到食品，顯示錯誤
        if (isEdit && !food) {
            console.error('❌ 找不到指定的食品');
            return { success: false, message: '找不到指定的食品' };
        }

        console.log(`✅ 成功顯示${isEdit ? '編輯' : '新增'}食品表單`);
        if (isEdit) {
            console.log('   編輯的食品:', food.name);
        }
        
        return { success: true, message: `${isEdit ? '編輯' : '新增'}食品表單已顯示` };
    }

    // 模擬顯示訂閱表單功能
    showSubscriptionForm(subscriptionId = null) {
        // 檢查 CRUD 管理器是否已初始化
        if (!this.crudManager || !this.crudManagerInitialized) {
            console.error('❌ CRUD 管理器未初始化，無法顯示表單');
            console.error('CRUD 管理器狀態:', {
                crudManager: !!this.crudManager,
                initialized: this.crudManagerInitialized
            });
            return { success: false, message: 'CRUD 管理器未初始化' };
        }

        const isEdit = subscriptionId !== null;
        const subscription = isEdit ? this.crudManager.readSubscription(subscriptionId) : null;
        
        // 如果是編輯模式但找不到訂閱，顯示錯誤
        if (isEdit && !subscription) {
            console.error('❌ 找不到指定的訂閱');
            return { success: false, message: '找不到指定的訂閱' };
        }

        console.log(`✅ 成功顯示${isEdit ? '編輯' : '新增'}訂閱表單`);
        if (isEdit) {
            console.log('   編輯的訂閱:', subscription.name);
        }
        
        return { success: true, message: `${isEdit ? '編輯' : '新增'}訂閱表單已顯示` };
    }

    // 模擬儲存食品表單功能
    saveFoodForm(foodData, foodId = null) {
        // 檢查 CRUD 管理器是否已初始化
        if (!this.crudManager || !this.crudManagerInitialized) {
            console.error('❌ CRUD 管理器未初始化，無法儲存');
            return { success: false, message: 'CRUD 管理器未初始化' };
        }

        try {
            let result;
            if (foodId) {
                result = this.crudManager.updateFood(foodId, foodData);
            } else {
                result = this.crudManager.createFood(foodData);
            }

            if (result.success) {
                console.log('✅ 食品儲存成功:', result.message);
                return result;
            } else {
                console.error('❌ 食品儲存失敗:', result.message);
                return result;
            }
        } catch (error) {
            console.error('❌ 儲存食品時發生錯誤:', error);
            return { success: false, message: '儲存時發生錯誤' };
        }
    }

    // 模擬儲存訂閱表單功能
    saveSubscriptionForm(subscriptionData, subscriptionId = null) {
        // 檢查 CRUD 管理器是否已初始化
        if (!this.crudManager || !this.crudManagerInitialized) {
            console.error('❌ CRUD 管理器未初始化，無法儲存');
            return { success: false, message: 'CRUD 管理器未初始化' };
        }

        try {
            let result;
            if (subscriptionId) {
                result = this.crudManager.updateSubscription(subscriptionId, subscriptionData);
            } else {
                result = this.crudManager.createSubscription(subscriptionData);
            }

            if (result.success) {
                console.log('✅ 訂閱儲存成功:', result.message);
                return result;
            } else {
                console.error('❌ 訂閱儲存失敗:', result.message);
                return result;
            }
        } catch (error) {
            console.error('❌ 儲存訂閱時發生錯誤:', error);
            return { success: false, message: '儲存時發生錯誤' };
        }
    }

    // 模擬主要操作按鈕功能
    refreshCurrentPage() {
        if (this.currentPage === 'food') {
            // 食品頁面 - 顯示新增食品表單
            return this.showFoodForm();
        } else if (this.currentPage === 'subscriptions') {
            // 訂閱頁面 - 顯示新增訂閱表單
            return this.showSubscriptionForm();
        } else {
            console.log('✅ 頁面已重新整理');
            return { success: true, message: '頁面已重新整理' };
        }
    }

    // 顯示當前狀態
    showStatus() {
        console.log('\n📊 當前狀態:');
        console.log('   CRUD 管理器:', this.crudManager ? '✅ 已載入' : '❌ 未載入');
        console.log('   初始化狀態:', this.crudManagerInitialized ? '✅ 已完成' : '❌ 未完成');
        console.log('   當前頁面:', this.currentPage);
        if (this.crudManager) {
            console.log('   食品數量:', this.crudManager.foodItems.length);
            console.log('   訂閱數量:', this.crudManager.subscriptions.length);
        }
    }
}

async function testAddFunctionality() {
    console.log('🧪 測試新增功能修正\n');

    // 創建 Mock App 實例
    const app = new MockAppWithAddFunctionality();
    
    // 初始化
    await app.init();
    
    // 顯示初始狀態
    app.showStatus();

    console.log('\n🍎 測試食品新增功能...');
    
    // 測試顯示新增食品表單
    app.currentPage = 'food';
    const showFormResult = app.refreshCurrentPage();
    console.log('顯示表單結果:', showFormResult.success ? '✅ 成功' : '❌ 失敗');

    // 測試直接新增食品
    const addFoodResult = app.saveFoodForm({
        name: '測試新增功能食品',
        brand: '測試品牌',
        price: 'NT$ 50',
        status: '良好',
        expiry: '2025-12-31'
    });
    console.log('新增食品結果:', addFoodResult.success ? '✅ 成功' : '❌ 失敗');

    console.log('\n📊 測試訂閱新增功能...');
    
    // 測試顯示新增訂閱表單
    app.currentPage = 'subscriptions';
    const showSubFormResult = app.refreshCurrentPage();
    console.log('顯示表單結果:', showSubFormResult.success ? '✅ 成功' : '❌ 失敗');

    // 測試直接新增訂閱
    const addSubResult = app.saveSubscriptionForm({
        name: '測試新增功能訂閱',
        url: 'https://test-add.example.com',
        price: 'NT$ 99',
        nextPayment: '2025-12-31'
    });
    console.log('新增訂閱結果:', addSubResult.success ? '✅ 成功' : '❌ 失敗');

    console.log('\n🔧 測試編輯功能...');
    
    // 測試編輯現有食品
    const foods = app.crudManager.readAllFood();
    if (foods.length > 0) {
        const editFormResult = app.showFoodForm(foods[0].id);
        console.log('顯示編輯食品表單:', editFormResult.success ? '✅ 成功' : '❌ 失敗');
    }

    // 測試編輯現有訂閱
    const subscriptions = app.crudManager.readAllSubscriptions();
    if (subscriptions.length > 0) {
        const editSubFormResult = app.showSubscriptionForm(subscriptions[0].id);
        console.log('顯示編輯訂閱表單:', editSubFormResult.success ? '✅ 成功' : '❌ 失敗');
    }

    // 顯示最終狀態
    app.showStatus();

    console.log('\n🎉 新增功能測試完成！');
    console.log('\n💡 修正內容:');
    console.log('1. ✅ showFoodForm 和 showSubscriptionForm 加入初始化檢查');
    console.log('2. ✅ saveFoodForm 和 saveSubscriptionForm 加入完整狀態檢查');
    console.log('3. ✅ refreshCurrentPage 支援食品和訂閱頁面的新增功能');
    console.log('4. ✅ 所有函數都有適當的錯誤處理和診斷信息');
}

testAddFunctionality().catch(console.error);