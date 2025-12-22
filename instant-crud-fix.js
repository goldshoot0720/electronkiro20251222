// 即時 CRUD 修正腳本 - 在瀏覽器控制台中執行

console.log('🔧 開始即時 CRUD 修正...');

// 檢查當前狀態
function checkCurrentStatus() {
    console.log('\n📊 當前狀態檢查:');
    console.log('1. App 實例:', typeof app !== 'undefined' ? '✅ 存在' : '❌ 不存在');
    
    if (typeof app !== 'undefined') {
        console.log('2. CRUD 管理器:', app.crudManager ? '✅ 存在' : '❌ 不存在');
        console.log('3. 初始化狀態:', app.crudManagerInitialized ? '✅ 已完成' : '❌ 未完成');
        console.log('4. Contentful 管理器:', app.contentfulManager ? '✅ 存在' : '❌ 不存在');
        
        if (app.crudManager) {
            console.log('5. 食品數量:', app.crudManager.foodItems?.length || 0);
            console.log('6. 訂閱數量:', app.crudManager.subscriptions?.length || 0);
        }
    }
}

// 強制重新初始化 CRUD 管理器
async function forceReinitializeCRUD() {
    console.log('\n🔄 強制重新初始化 CRUD 管理器...');
    
    if (typeof app === 'undefined') {
        console.error('❌ App 實例不存在，無法初始化');
        return false;
    }
    
    try {
        // 重置狀態
        app.crudManagerInitialized = false;
        
        // 重新初始化 Contentful
        if (!app.contentfulManager) {
            console.log('初始化 Contentful 管理器...');
            await app.initContentful();
        }
        
        // 重新初始化 CRUD 管理器
        console.log('初始化 CRUD 管理器...');
        await app.initCrudManager();
        
        console.log('✅ 重新初始化完成');
        return true;
    } catch (error) {
        console.error('❌ 重新初始化失敗:', error);
        return false;
    }
}

// 修正函數引用問題
function fixFunctionReferences() {
    console.log('\n🔧 修正函數引用...');
    
    if (typeof app === 'undefined') {
        console.error('❌ App 實例不存在');
        return false;
    }
    
    // 確保所有 CRUD 函數都正確綁定
    const functionsToCheck = [
        'showFoodForm',
        'showSubscriptionForm', 
        'saveFoodForm',
        'saveSubscriptionForm',
        'deleteFood',
        'deleteSubscription',
        'editFood',
        'editSubscription'
    ];
    
    let allFunctionsExist = true;
    
    functionsToCheck.forEach(funcName => {
        if (typeof app[funcName] === 'function') {
            console.log(`✅ ${funcName}: 存在`);
        } else {
            console.log(`❌ ${funcName}: 不存在`);
            allFunctionsExist = false;
        }
    });
    
    return allFunctionsExist;
}

// 手動創建 CRUD 管理器（緊急修正）
async function emergencyCreateCRUD() {
    console.log('\n🚨 緊急創建 CRUD 管理器...');
    
    if (typeof CrudManager === 'undefined') {
        console.error('❌ CrudManager 類別不存在');
        return false;
    }
    
    if (typeof ContentfulManager === 'undefined') {
        console.error('❌ ContentfulManager 類別不存在');
        return false;
    }
    
    try {
        // 創建 Contentful 管理器
        const contentfulManager = new ContentfulManager();
        
        // 創建 CRUD 管理器
        const crudManager = new CrudManager(contentfulManager);
        
        // 載入資料
        await crudManager.loadInitialData();
        
        // 手動設定到 app
        if (typeof app !== 'undefined') {
            app.contentfulManager = contentfulManager;
            app.crudManager = crudManager;
            app.crudManagerInitialized = true;
            
            console.log('✅ 緊急 CRUD 管理器創建成功');
            return true;
        } else {
            console.error('❌ App 實例不存在，無法設定');
            return false;
        }
    } catch (error) {
        console.error('❌ 緊急創建失敗:', error);
        return false;
    }
}

// 測試 CRUD 功能
function testCRUDFunctions() {
    console.log('\n🧪 測試 CRUD 功能...');
    
    if (!app || !app.crudManager || !app.crudManagerInitialized) {
        console.error('❌ CRUD 管理器未準備好');
        return false;
    }
    
    try {
        // 測試讀取功能
        const foods = app.crudManager.readAllFood();
        const subscriptions = app.crudManager.readAllSubscriptions();
        
        console.log('✅ 讀取功能正常');
        console.log(`   食品: ${foods.length} 項`);
        console.log(`   訂閱: ${subscriptions.length} 項`);
        
        // 測試表單顯示功能
        if (typeof app.showFoodForm === 'function') {
            console.log('✅ showFoodForm 函數存在');
        } else {
            console.error('❌ showFoodForm 函數不存在');
        }
        
        if (typeof app.showSubscriptionForm === 'function') {
            console.log('✅ showSubscriptionForm 函數存在');
        } else {
            console.error('❌ showSubscriptionForm 函數不存在');
        }
        
        return true;
    } catch (error) {
        console.error('❌ 測試失敗:', error);
        return false;
    }
}

// 主要修正流程
async function runInstantFix() {
    console.log('🚀 開始即時修正流程...\n');
    
    // 1. 檢查當前狀態
    checkCurrentStatus();
    
    // 2. 檢查函數引用
    const functionsOK = fixFunctionReferences();
    
    // 3. 如果 CRUD 管理器未初始化，嘗試重新初始化
    if (typeof app !== 'undefined' && (!app.crudManager || !app.crudManagerInitialized)) {
        console.log('\n⚠️ CRUD 管理器未初始化，嘗試修正...');
        
        // 嘗試正常重新初始化
        const reinitSuccess = await forceReinitializeCRUD();
        
        if (!reinitSuccess) {
            console.log('\n🚨 正常初始化失敗，嘗試緊急修正...');
            await emergencyCreateCRUD();
        }
    }
    
    // 4. 最終測試
    console.log('\n🔍 最終狀態檢查:');
    checkCurrentStatus();
    testCRUDFunctions();
    
    // 5. 提供使用建議
    console.log('\n💡 使用建議:');
    if (app && app.crudManager && app.crudManagerInitialized) {
        console.log('✅ CRUD 功能已修復，可以正常使用');
        console.log('   - 新增食品: app.showFoodForm()');
        console.log('   - 新增訂閱: app.showSubscriptionForm()');
        console.log('   - 重新載入頁面: app.loadFood() 或 app.loadSubscriptions()');
    } else {
        console.log('❌ 修復失敗，建議重新載入頁面');
        console.log('   - 按 F5 重新載入頁面');
        console.log('   - 或執行: location.reload()');
    }
}

// 導出函數供手動使用
window.instantCRUDFix = {
    checkStatus: checkCurrentStatus,
    reinitialize: forceReinitializeCRUD,
    emergencyFix: emergencyCreateCRUD,
    test: testCRUDFunctions,
    runFix: runInstantFix
};

// 自動執行修正
runInstantFix().catch(console.error);

console.log('\n📝 手動修正指令:');
console.log('- instantCRUDFix.checkStatus()    // 檢查狀態');
console.log('- instantCRUDFix.reinitialize()   // 重新初始化');
console.log('- instantCRUDFix.emergencyFix()   // 緊急修正');
console.log('- instantCRUDFix.test()           // 測試功能');
console.log('- instantCRUDFix.runFix()         // 完整修正流程');